"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express");
const requests_1 = require("./models/requests");
const autoinsert_1 = require("./controllers/autoinsert");
const node_cron_1 = require("node-cron");
const dotenv = __importStar(require("dotenv"));
const ngrok_1 = require("ngrok");
const express_1 = __importDefault(require("express"));
dotenv.config();
const app = (0, express_1.default)();
const { PORT, NGROK_TOKEN, HOSTNAME } = process.env;
const port = PORT || 3000;
const hostname = HOSTNAME || 'localhost';
const server = async () => {
    try {
        app.listen(port, () => {
            console.log(`Server is running on http://${hostname}:${port}`);
        });
        const url = await (0, ngrok_1.connect)({
            addr: port,
            authtoken: NGROK_TOKEN,
        });
    }
    catch (err) {
        console.log(err);
    }
};
app.use(requests_1.router);
server();
(0, node_cron_1.schedule)('*/5 * * * *', async () => {
    (0, autoinsert_1.dataFromDB)();
});
//# sourceMappingURL=server.js.map