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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const LeadSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    shorthand: { type: String, required: false },
    headline: { type: String, required: false },
    jobTitle: { type: String, required: false },
    companyName: { type: String, required: false },
    location: { type: String, required: false },
    profileUrl: { type: String, required: true },
    summary: { type: String, required: false },
    additionalInfo: { type: String, required: false },
    sourceUrl: { type: String, required: true },
    scrapedAt: { type: Date, default: Date.now, required: true },
    profileImage: { type: String, required: false }, // Store image as base64 string
});
// Create a compound index on profileUrl and sourceUrl to ensure uniqueness for the combination
LeadSchema.index({ profileUrl: 1, sourceUrl: 1 }, { unique: true });
exports.default = mongoose_1.default.model('Lead', LeadSchema);
