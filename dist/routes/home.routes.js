"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const home_controller_1 = require("../controllers/home.controller");
const router = express_1.default.Router();
// Route untuk mendapatkan daftar anime
router.get('/home', home_controller_1.getAnimes);
// Route untuk mendapatkan batch anime dengan pagination
router.get('/batch', home_controller_1.getBatchAnimes);
exports.default = router;
