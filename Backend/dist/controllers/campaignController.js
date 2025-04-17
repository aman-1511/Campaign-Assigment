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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCampaign = exports.updateCampaign = exports.createCampaign = exports.getCampaignById = exports.getAllCampaigns = void 0;
const Campaign_1 = __importStar(require("../models/Campaign"));
// Get all campaigns (excluding deleted ones)
const getAllCampaigns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaigns = yield Campaign_1.default.find({ status: { $ne: Campaign_1.CampaignStatus.DELETED } });
        res.status(200).json(campaigns);
    }
    catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ message: 'Failed to fetch campaigns' });
    }
});
exports.getAllCampaigns = getAllCampaigns;
// Get campaign by ID
const getCampaignById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaign = yield Campaign_1.default.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        if (campaign.status === Campaign_1.CampaignStatus.DELETED) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        res.status(200).json(campaign);
    }
    catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ message: 'Failed to fetch campaign' });
    }
});
exports.getCampaignById = getCampaignById;
// Create a new campaign
const createCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCampaign = new Campaign_1.default({
            name: req.body.name,
            description: req.body.description,
            status: req.body.status || Campaign_1.CampaignStatus.INACTIVE,
            leads: req.body.leads || [],
            accountIDs: req.body.accountIDs || [],
        });
        const savedCampaign = yield newCampaign.save();
        res.status(201).json(savedCampaign);
    }
    catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ message: 'Failed to create campaign' });
    }
});
exports.createCampaign = createCampaign;
// Update campaign
const updateCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaign = yield Campaign_1.default.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        if (campaign.status === Campaign_1.CampaignStatus.DELETED) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        const updatedCampaign = yield Campaign_1.default.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        res.status(200).json(updatedCampaign);
    }
    catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ message: 'Failed to update campaign' });
    }
});
exports.updateCampaign = updateCampaign;
// Soft delete campaign (set status to DELETED)
const deleteCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaign = yield Campaign_1.default.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        const deletedCampaign = yield Campaign_1.default.findByIdAndUpdate(req.params.id, { status: Campaign_1.CampaignStatus.DELETED }, { new: true });
        res.status(200).json({ message: 'Campaign deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ message: 'Failed to delete campaign' });
    }
});
exports.deleteCampaign = deleteCampaign;
