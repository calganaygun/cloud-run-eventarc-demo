const vision = require("@google-cloud/vision");

const visionClient = new vision.ImageAnnotatorClient();

async function detectLandmarks(fileName) {
  const [result] = await visionClient.landmarkDetection(fileName);
  const landmarks = result.landmarkAnnotations;
  return landmarks;
}

async function detectText(fileName) {
  const [result] = await visionClient.textDetection(fileName);
  const text = result.textAnnotations;
  return text;
}

async function detectLabels(fileName) {
  const [result] = await visionClient.labelDetection(fileName);
  const labels = result.labelAnnotations;
  return labels.reduce((acc, label) => {
    if (label.score > 0.7) {
      acc.push(label.description);
    }
    return acc;
  }, []);
}

async function detectLogos(fileName) {
  const [result] = await visionClient.logoDetection(fileName);
  const logos = result.logoAnnotations;
  return logos;
}

async function detectSafeSearch(fileName) {
  const [result] = await visionClient.safeSearchDetection(fileName);
  const safeSearch = result.safeSearchAnnotation;
  return safeSearch;
}

async function detectProperties(fileName) {
  const [result] = await visionClient.imageProperties(fileName);
  const properties = result.imagePropertiesAnnotation;
  return properties;
}

async function detectWeb(fileName) {
  const [result] = await visionClient.webDetection(fileName);
  const web = result.webDetection;
  return web;
}

async function safeImage(req, res, next) {
  const safeSearch = await detectSafeSearch(req.files.image.tempFilePath);
  const isSafe =
    safeSearch.adult === "VERY_UNLIKELY" &&
    safeSearch.violence === "VERY_UNLIKELY";

  if (!isSafe) {
    res.status(400).send("Image is not safe.");
    return;
  }

  next();
}

module.exports = {
  detectLandmarks,
  detectText,
  detectLabels,
  detectLogos,
  detectSafeSearch,
  detectProperties,
  detectWeb,
  safeImage,
};
