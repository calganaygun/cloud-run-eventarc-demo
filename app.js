const express = require("express");

const { Storage } = require("@google-cloud/storage");
const {
  detectLandmarks,
  detectWeb,
  detectLabels,
  safeImage,
} = require("./libs/vision");
const { addDataToAlgolia } = require("./libs/algolia");

const expressFileUpload = require("express-fileupload");

const storage = new Storage();

const app = express();

const fileUploadOptions = {
  limits: { fileSize: 10 * 1024 * 1024 },
  useTempFiles: true,
};

app.use("/", express.static("static"));

app.post(
  "/uploadImage",
  expressFileUpload(fileUploadOptions),
  safeImage,
  async (req, res) => {
    if (!req.files) {
      res.status(400).send("No files were uploaded.");
      return;
    }

    const file = req.files.image;

    const timestamp = Date.now().toString();
    const fileName = `${timestamp}-${file.name}`;

    const bucketName = process.env.BUCKET_NAME;
    const bucket = storage.bucket(bucketName);

    await bucket.upload(file.tempFilePath, {
      destination: fileName,
      public: true,
    });

    res.send("File uploaded to Google Cloud Storage.");
  }
);

app.post("/event", async (req, res) => {
  const bucketName = req.headers["ce-bucket"];
  const fileName = req.headers["ce-subject"].replace("objects/", "");
  const fileURL =
    "https://storage.googleapis.com/" + bucketName + "/" + fileName;

  const landmarks = await detectLandmarks(fileURL);
  const webResults = await detectWeb(fileURL);
  const labels = await detectLabels(fileURL);

  const visionExtractedData = {
    objectID: fileName,
    url: fileURL,
    landmarks,
    webResults,
    labels,
  };

  await addDataToAlgolia(visionExtractedData);

  res.send("Added to Algolia.");
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server started.");
});
