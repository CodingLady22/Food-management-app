import multer from "multer";
import path from "path";


// export const upload = multer({

  const storage = multer.diskStorage({
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== '.pdf') {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
})

const upload = multer({ storage: storage });
// multer({
//   storage: multer.diskStorage({}),
//   fileFilter: (req, file, cb) => {
//     let ext = path.extname(file.originalname);
//     if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== '.pdf') {
//       cb(new Error("File type is not supported"), false);
//       return;
//     }
//     cb(null, true);
//   },
// })

export default upload