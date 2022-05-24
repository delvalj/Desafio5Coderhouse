// EJERCICIO DESAFIO CLASE 10 con PUG
const fs = require("fs");
const express = require("express");
const app = express();
const { Router } = express;
const router = Router();
const multer = require("multer");
const storage = multer({ destinantion: "/upload" });
const PORT = 8082;

// Check if the file exists
let fileExists = fs.existsSync("NuevosProductos.txt");
console.log("NuevosProductos.txt exists:", fileExists);

// If the file does not exist
// create it
if (!fileExists) {
  console.log("Creating the file");
  fs.writeFileSync("NuevosProductos.txt", "[]");
  console.log("Archivo NuevosProductos.txt Creado!");
}

class Contenedor {
  constructor(nombreArchivo) {
    this.nombreArchivo = nombreArchivo;
  }

  /**
   * @param {json} producto
   * Metodo para guardar un producto. Al terminar de grabar, muestra por pantalla el ID del producto agregado.
   */
  async metodoSave(producto) {
    try {
      const contenido = JSON.parse(
        await fs.promises.readFile(this.nombreArchivo)
      );
      if (contenido === "") {
        console.log("No hay datos");
      } else {
        producto.id = contenido.length + 1;
        contenido.push(producto);
        await fs.promises.writeFile(
          this.nombreArchivo,
          JSON.stringify(contenido)
        );
        console.log("El Id del Producto es " + producto.id);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Metodo para obtener todos los productos
   */
  async getAll() {
    try {
      const contenido = JSON.parse(
        await fs.promises.readFile(this.nombreArchivo)
      );

      console.log(contenido);
      return contenido;
    } catch (error) {
      console.log("Error en getAll", error);
      return [];
    }
  }
}

const ejecutarProductos = async () => {
  const productos = new Contenedor("NuevosProductos.txt");
};

ejecutarProductos();

// -------------------------------------------------------------------------------------------------------//
// Codigo del server

// Middleware para parsear el Body. Sin esto no obtenemos el Body. SIEMPRE QUE USAMOS POST HAY QUE USARLO.
// El body llega como strings. Lo que hace el middleware es transformarlo en JSON y mandarlo a la funcion que debe controlarlo.
app.use(express.json());
// Hace lo mismo pero con dato de formularios. Un form en HTML viene en forma de URL encoded y esto lo trasnforma en formulario.
app.use(express.urlencoded({ extended: true }));

// Va a buscar en la carpeta PUBLIC si existe el archivo buscado.
app.use(express.static("public"));

// ROUTER
app.use("/api", router);

// Views Engine
app.set("views", "./pug_views");
app.set("view engine", "pug");

// Redirecciono al Formulario cuando la llamada es a la raiz
app.get("/", function (req, res) {
  // On getting the home route request,
  // the user will be redirected to GFG website
  res.redirect(`http://localhost:${PORT}/desafio5.html`);
});

router.get("/productos", (req, res, next) => {
  const mostrarProductos = async () => {
    const productos = new Contenedor("NuevosProductos.txt");
    const showProductos = await productos.getAll();
    res.render("agreagado", { showProductos });
  };
  mostrarProductos();
});

const productoSubido = storage.fields([
  { title: "title", price: "price", thumbnail: "thumbnail" },
]);

router.post("/productos", productoSubido, async (req, res, next) => {
  const subirProduct = async () => {
    let produc = new Contenedor("NuevosProductos.txt");
    if (
      req.body.title === "" ||
      req.body.price === "" ||
      req.body.thumbnail === ""
    ) {
      res.status(400).send({
        error: "No se pudo cargar el producto. Complete los campos vacios.",
      });
    } else {
      await produc.metodoSave(req.body);

      res.redirect(`http://localhost:${PORT}/desafio5.html`);
    }
    next();
  };
  subirProduct();
});

app.listen(PORT, () => {
  console.log(`Servidor Corriendo en el puerto ${PORT}`);
});
