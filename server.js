const http = require("http");
const express = require("express");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const cuid = require("cuid");
const { unlink } = require("fs/promises");
require("dotenv").config();

app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.originalname.split(".")[0]}_${cuid()}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({ storage });

app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ msg: "Nenhum arquivo recebido." });
  }
  if (!req.file.filename) {
    res
      .status(500)
      .json({ msg: "Houve algum problema ao tentar salvar o arquivo." });
  }
  const fileUrl = process.env.BASE_URL + "/" + req.file.filename;
  res.status(200).json({ fileUrl: fileUrl });
});

app.put("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ msg: "Nenhum arquivo recebido." });
  }
  if (!req.file.filename) {
    res
      .status(500)
      .json({ msg: "Houve algum problema ao tentar salvar o arquivo." });
  }
  if (!req?.body?.oldFileUrl) {
    res
      .status(400)
      .json({
        msg: "Você precisa enviar a oldFileUrl referente à URL do arquivo a ser substituído.",
      });
  }

  const fileUrl = process.env.BASE_URL + "/" + req.file.filename;

  const oldFileUrl = req.body?.oldFileUrl;
  const oldFileNameParts = oldFileUrl.split("/");
  const oldFileName = oldFileNameParts[oldFileNameParts.length - 1];
  const oldFilePath = "./public/" + oldFileName;

  try {
    await unlink(oldFilePath);
    res.status(200).json({ msg: "Sucesso!", fileUrl: fileUrl });
  } catch (error) {
    res
      .status(200)
      .json({
        erro: true,
        fileUrl: fileUrl,
        msg: "Houve um erro ao tentar excluir o arquivo anterior no servidor, mas tudo bem. O arquivo pode já ter sido excluído.",
      });
  }
});

app.delete("/upload", async (req, res) => {
  if (!req?.body?.fileUrl) {
    res.status(400).json({ msg: "Nenhuma URL recebida." });
  }
  const fileUrl = req.body?.fileUrl;
  const fileNameParts = fileUrl.split("/");
  const fileName = fileNameParts[fileNameParts.length - 1];
  const filePath = "./public/" + fileName;

  try {
    await unlink(filePath);
    res.status(200).json({ msg: "Sucesso!" });
  } catch (error) {
    res
      .status(500)
      .json({
        msg: "Houve um erro ao tentar o arquivo no servidor, mas tudo bem. O arquivo pode já ter sido excluído.",
      });
  }
});


http.createServer(app).listen(4000, () => {
console.log("Uploader is running at port 4000");
});
