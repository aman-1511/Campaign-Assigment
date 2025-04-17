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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const chrome_1 = __importDefault(require("selenium-webdriver/chrome"));
const Lead_1 = __importDefault(require("../models/Lead"));
const fs_1 = __importDefault(require("fs"));
const LINKEDIN_LOGIN_URL = 'https://www.linkedin.com/login';
// Remove hardcoded credentials
// LINKEDIN_EMAIL and LINKEDIN_PASSWORD will now be passed as parameters
function delay(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
// Updated to accept credentials as parameters
function handleLogin(driver, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Navigating to LinkedIn login page...');
            yield driver.get(LINKEDIN_LOGIN_URL);
            yield delay(2000); // Wait for page to load
            // Check if already logged in
            const currentUrl = yield driver.getCurrentUrl();
            if (!currentUrl.includes('linkedin.com/login')) {
                console.log('Already logged in');
                return true;
            }
            console.log('Filling login credentials...');
            // Fill email/username
            const emailField = yield driver.findElement(selenium_webdriver_1.By.id('username'));
            yield emailField.clear();
            yield emailField.sendKeys(email);
            // Fill password
            const passwordField = yield driver.findElement(selenium_webdriver_1.By.id('password'));
            yield passwordField.clear();
            yield passwordField.sendKeys(password);
            console.log('Clicking sign in button...');
            // Click sign in button
            const signInButton = yield driver.findElement(selenium_webdriver_1.By.css('.login__form_action_container button'));
            yield signInButton.click();
            // Wait for navigation to complete
            console.log('Waiting for navigation after login...');
            yield delay(5000); // Give time for login to complete
            // Take screenshot to help debug
            yield driver.takeScreenshot().then((data) => {
                fs_1.default.writeFileSync('verification-debug.png', data, 'base64');
                console.log('Login page screenshot saved as verification-debug.png');
            });
            // Check if we're at verification/checkpoint page
            const pageUrl = yield driver.getCurrentUrl();
            const pageHtml = yield driver.getPageSource();
            // Save page content for debugging
            fs_1.default.writeFileSync('verification-page.html', pageHtml);
            if (pageUrl.includes('checkpoint') ||
                pageHtml.includes('verification') ||
                pageHtml.includes('challenge') ||
                pageHtml.includes('security')) {
                console.log('=== VERIFICATION REQUIRED ===');
                console.log('LinkedIn security checkpoint detected.');
                console.log('Please complete the verification challenge in the browser window.');
                console.log('The system will automatically continue once verification is complete.');
                // Instead of waiting for user input, periodically check if we've reached the feed page
                let verificationComplete = false;
                const maxWaitTime = 300000; // 5 minutes maximum wait time
                const startTime = Date.now();
                while (!verificationComplete) {
                    // Check current URL
                    const currentUrl = yield driver.getCurrentUrl();
                    console.log(`Checking current URL: ${currentUrl}`);
                    // If we've reached the feed page or another LinkedIn page that's not the checkpoint
                    if (currentUrl.includes('linkedin.com/feed') ||
                        (currentUrl.includes('linkedin.com') &&
                            !currentUrl.includes('checkpoint') &&
                            !currentUrl.includes('challenge') &&
                            !currentUrl.includes('security'))) {
                        console.log('Verification completed! Detected LinkedIn feed page.');
                        verificationComplete = true;
                        // Take a screenshot to confirm the new state
                        yield driver.takeScreenshot().then((data) => {
                            fs_1.default.writeFileSync('after-verification.png', data, 'base64');
                        });
                        break;
                    }
                    // Check if we've exceeded the maximum wait time
                    if (Date.now() - startTime > maxWaitTime) {
                        console.log('Timeout waiting for verification. Please complete verification and restart the process.');
                        return false;
                    }
                    // Wait before checking again
                    console.log('Waiting for verification to complete...');
                    yield delay(5000); // Check every 5 seconds
                }
                // Additional delay after verification to ensure page fully loads
                console.log('Continuing after verification...');
                yield delay(3000);
            }
            // Check if login was successful - we should be on LinkedIn home page or feed
            const newUrl = yield driver.getCurrentUrl();
            if (!newUrl.includes('linkedin.com/login') &&
                !newUrl.includes('checkpoint') &&
                !newUrl.includes('challenge')) {
                console.log('Login successful');
                return true;
            }
            else {
                // Check if there was an error message
                try {
                    const pageSource = yield driver.getPageSource();
                    fs_1.default.writeFileSync('login-error.html', pageSource);
                    const errorElement = yield driver.findElement(selenium_webdriver_1.By.css('[error-for="password"]'));
                    const errorText = yield errorElement.getText();
                    console.error('Login failed:', errorText);
                }
                catch (e) {
                    console.error('Login failed for unknown reason');
                }
                return false;
            }
        }
        catch (error) {
            console.error('Error during login:', error);
            return false;
        }
    });
}
// Enhance extractTextContent function to handle empty values better
function extractTextContent(element_1, selector_1) {
    return __awaiter(this, arguments, void 0, function* (element, selector, defaultValue = '') {
        try {
            const targetElement = yield element.findElement(selenium_webdriver_1.By.css(selector));
            const text = yield targetElement.getText();
            return text && text.trim() ? text.trim() : defaultValue;
        }
        catch (e) {
            return defaultValue;
        }
    });
}
// Add a new utility function to extract and validate LinkedIn profile URLs
function extractProfileUrl(element) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Extracting profile URL...');
            // 1. Find all links and look for LinkedIn profile patterns
            const links = yield element.findElements(selenium_webdriver_1.By.css('a[href]'));
            for (const link of links) {
                const href = yield link.getAttribute('href');
                // Check if it's a LinkedIn profile URL
                if (href && href.includes('/in/')) {
                    try {
                        // Clean the URL by removing query parameters
                        const url = new URL(href);
                        // Get just the /in/username part
                        const pathname = url.pathname;
                        if (pathname.startsWith('/in/')) {
                            const cleanUrl = `https://www.linkedin.com${pathname}`;
                            console.log(`Extracted profile URL: ${cleanUrl}`);
                            return cleanUrl;
                        }
                    }
                    catch (e) {
                        // If URL parsing fails, just return the original href
                        if (href.includes('/in/')) {
                            console.log(`Using original profile URL: ${href}`);
                            return href;
                        }
                    }
                }
            }
            // 2. Try a more general approach with XPath to find any LinkedIn profile links
            try {
                const profileLinks = yield element.findElements(selenium_webdriver_1.By.xpath('.//a[contains(@href, "linkedin.com/in/")]'));
                if (profileLinks.length > 0) {
                    const href = yield profileLinks[0].getAttribute('href');
                    if (href) {
                        console.log(`Found profile URL with XPath: ${href}`);
                        // Clean it up if possible
                        try {
                            const url = new URL(href);
                            const pathname = url.pathname;
                            if (pathname.startsWith('/in/')) {
                                return `https://www.linkedin.com${pathname}`;
                            }
                        }
                        catch (e) {
                            // Return as is if cleaning fails
                            return href;
                        }
                    }
                }
            }
            catch (e) {
                // Continue with other methods
            }
            console.log('No profile URL found');
            return '';
        }
        catch (e) {
            console.log('Error extracting profile URL');
            return '';
        }
    });
}
// Enhance the name extraction function to handle dynamic class names
function extractProfileName(profile) {
    return __awaiter(this, void 0, void 0, function* () {
        let fullName = 'Unknown Name';
        let shorthand = 'UN';
        try {
            console.log('Extracting profile name...');
            // Use multiple approaches for name extraction that don't rely on specific class names
            // 1. First try to get name from image alt attribute
            try {
                const imgElements = yield profile.findElements(selenium_webdriver_1.By.css('img[alt]:not([alt=""])'));
                for (const imgElement of imgElements) {
                    const altText = yield imgElement.getAttribute('alt');
                    if (altText && altText.trim() && altText.length > 3 &&
                        !altText.includes('Status') && !altText.includes('LinkedIn')) {
                        fullName = altText.trim();
                        shorthand = 'RN'; // Real Name
                        console.log(`Extracted name from image alt: ${fullName}`);
                        return { fullName, shorthand };
                    }
                }
            }
            catch (e) {
                // Continue if image extraction fails
            }
            // 2. Try attribute-based selectors (less likely to change than class names)
            try {
                // Look for links with dir="ltr" attribute, which often contain the name
                const elements = yield profile.findElements(selenium_webdriver_1.By.css('a[href*="/in/"] span[dir="ltr"]'));
                for (const element of elements) {
                    const text = yield element.getText();
                    if (text && text.trim() && text.length > 3 &&
                        !text.includes('Status') && !text.includes('LinkedIn Member')) {
                        fullName = text.trim();
                        shorthand = 'RN'; // Real Name
                        console.log(`Extracted name from link text: ${fullName}`);
                        return { fullName, shorthand };
                    }
                }
            }
            catch (e) {
                // Continue if attribute-based extraction fails
            }
            // 3. Try using XPath to find title elements - more structural and less class-dependent
            try {
                const possibleTitleElements = yield profile.findElements(selenium_webdriver_1.By.xpath('.//a[contains(@href, "/in/")]//span[@aria-hidden="true"]'));
                for (const element of possibleTitleElements) {
                    const text = yield element.getText();
                    if (text && text.trim() && text.length > 3 && !text.includes('LinkedIn')) {
                        fullName = text.trim();
                        shorthand = 'RN'; // Real Name
                        console.log(`Extracted name using XPath: ${fullName}`);
                        return { fullName, shorthand };
                    }
                }
            }
            catch (e) {
                // Continue if XPath extraction fails
            }
            // 4. As a fallback, analyze all text content in the profile component
            try {
                const profileText = yield profile.getText();
                const lines = profileText.split('\n');
                // LinkedIn profiles typically have name as one of the first few lines
                // Names are usually short and don't contain common UI text
                for (const line of lines.slice(0, 10)) {
                    const trimmedLine = line.trim();
                    if (trimmedLine && trimmedLine.length > 2 && trimmedLine.length < 40 &&
                        !trimmedLine.includes('Connect') &&
                        !trimmedLine.includes('Message') &&
                        !trimmedLine.includes('degree') &&
                        !trimmedLine.includes('LinkedIn')) {
                        // Check if this looks like a name (may contain spaces but not lots of special chars)
                        if (/^[A-Za-z\s\-'.]+$/.test(trimmedLine)) {
                            fullName = trimmedLine;
                            shorthand = 'RN';
                            console.log(`Extracted name from profile text: ${fullName}`);
                            return { fullName, shorthand };
                        }
                    }
                }
            }
            catch (e) {
                // Ignore errors from getText
            }
            // If we get here, we couldn't extract a name
            if (fullName === 'Unknown Name') {
                console.log('Could not extract name from profile, using Unknown Name');
            }
        }
        catch (e) {
            console.error('Error extracting name, using default: Unknown Name', e);
        }
        return { fullName, shorthand };
    });
}
// Enhanced job details extraction to handle dynamic class names
function extractJobDetails(profile) {
    return __awaiter(this, void 0, void 0, function* () {
        let jobTitle = '';
        let companyName = undefined;
        let headline = '';
        try {
            console.log('Extracting job details...');
            // 1. Try to find headline by structural position rather than class name
            // Typically in LinkedIn the headline is right after the name
            try {
                // Using XPath to find the subtitle element that typically contains job information
                const headlineElements = yield profile.findElements(selenium_webdriver_1.By.xpath('.//*[contains(@class, "subtitle") or contains(@class, "headline") or contains(@class, "primary-subtitle")]'));
                for (const element of headlineElements) {
                    const text = yield element.getText();
                    if (text && text.trim()) {
                        headline = text.trim();
                        console.log(`Extracted headline: ${headline}`);
                        // Parse job title and company if in format "Title at Company"
                        if (headline.includes(' at ')) {
                            const parts = headline.split(' at ');
                            if (parts.length >= 2) {
                                jobTitle = parts[0].trim();
                                companyName = parts[1].trim();
                                console.log(`Parsed job title: ${jobTitle}, company: ${companyName}`);
                                // If we successfully parsed, we can return early
                                return { jobTitle, companyName, headline };
                            }
                        }
                        else {
                            // If no "at" pattern, just use the headline as job title
                            jobTitle = headline;
                            break;
                        }
                    }
                }
            }
            catch (e) {
                // Continue with other approaches
            }
            // 2. If the above didn't work, try to analyze all text in the profile
            if (!headline || !jobTitle) {
                try {
                    const profileText = yield profile.getText();
                    const lines = profileText.split('\n');
                    // LinkedIn typically has the headline/job title in the first few lines after the name
                    for (let i = 0; i < Math.min(lines.length, 15); i++) {
                        const line = lines[i].trim();
                        // Skip empty lines or common UI text
                        if (!line || line.includes('Connect') || line.includes('Message') ||
                            line.includes('degree') || line === 'LinkedIn Member') {
                            continue;
                        }
                        // Look for job patterns like "X at Y"
                        if (line.includes(' at ')) {
                            headline = line;
                            const parts = line.split(' at ');
                            if (parts.length >= 2) {
                                jobTitle = parts[0].trim();
                                companyName = parts[1].trim();
                                console.log(`Found job title in text: ${jobTitle}, company: ${companyName}`);
                                break;
                            }
                        }
                        // Consider this line might be just the job title
                        else if (!jobTitle && line.length < 50) {
                            // Common job title keywords
                            const jobKeywords = ['manager', 'engineer', 'developer', 'recruiter', 'consultant',
                                'director', 'specialist', 'analyst', 'lead', 'head',
                                'designer', 'architect', 'founder', 'president', 'ceo', 'cto', 'coo'];
                            // Check if this line might be a job title
                            const lowerLine = line.toLowerCase();
                            if (jobKeywords.some(keyword => lowerLine.includes(keyword))) {
                                jobTitle = line;
                                headline = line;
                                console.log(`Found likely job title: ${jobTitle}`);
                            }
                        }
                    }
                }
                catch (e) {
                    // Ignore errors from text analysis
                }
            }
            // 3. Look for "Current: X at Y" pattern in any text element
            try {
                // Find all elements with visible text
                const textElements = yield profile.findElements(selenium_webdriver_1.By.xpath('.//*[text()]'));
                for (const element of textElements) {
                    const text = yield element.getText();
                    if (text && text.includes('Current:')) {
                        const currentMatch = text.match(/Current:\s+([^:]+)/i);
                        if (currentMatch && currentMatch[1]) {
                            const currentInfo = currentMatch[1].trim();
                            if (currentInfo.includes(' at ')) {
                                const parts = currentInfo.split(' at ');
                                if (parts.length >= 2) {
                                    // If job title is still empty, extract from here
                                    if (!jobTitle) {
                                        jobTitle = parts[0].trim();
                                        console.log(`Extracted job title from 'Current': ${jobTitle}`);
                                    }
                                    // Extract company from the part after "at"
                                    if (!companyName) {
                                        // Try to get just the company name by taking the first chunk
                                        const companyPart = parts[1].split(/[ (]/)[0].trim();
                                        if (companyPart) {
                                            companyName = companyPart;
                                            console.log(`Extracted company from 'Current': ${companyName}`);
                                        }
                                    }
                                    // Set headline if it's still empty
                                    if (!headline) {
                                        headline = currentInfo;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            catch (e) {
                // Ignore errors from this extraction method
            }
        }
        catch (e) {
            console.log('Error extracting job details', e);
        }
        return { jobTitle, companyName, headline };
    });
}
// Enhanced location extraction to handle dynamic class names
function extractLocation(profile) {
    return __awaiter(this, void 0, void 0, function* () {
        let location = '';
        try {
            console.log('Extracting location...');
            // 1. Try to identify location by common patterns in class names
            try {
                const locationElements = yield profile.findElements(selenium_webdriver_1.By.xpath('.//*[contains(@class, "location") or contains(@class, "secondary-subtitle")]'));
                for (const element of locationElements) {
                    const text = yield element.getText();
                    if (text && text.trim()) {
                        location = text.trim();
                        console.log(`Extracted location: ${location}`);
                        return location;
                    }
                }
            }
            catch (e) {
                // Try alternative methods
            }
            // 2. Analyze text content for location patterns
            try {
                const profileText = yield profile.getText();
                const lines = profileText.split('\n');
                // Common locations that might appear in profiles
                const commonLocations = [
                    'New York', 'London', 'Bengaluru', 'San Francisco', 'Mumbai', 'Delhi',
                    'Singapore', 'United States', 'United Kingdom', 'India', 'Germany',
                    'France', 'Canada', 'Australia', 'Toronto', 'Sydney', 'Chicago',
                    'Los Angeles', 'Boston', 'Seattle', 'Dubai', 'Tokyo', 'Hong Kong'
                ];
                // Check if any line has a common location
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    // Skip lines that are too long or empty
                    if (!trimmedLine || trimmedLine.length > 50)
                        continue;
                    // Check if this line contains a common location
                    for (const commonLocation of commonLocations) {
                        if (trimmedLine.includes(commonLocation)) {
                            location = trimmedLine;
                            console.log(`Found location in text: ${location}`);
                            return location;
                        }
                    }
                    // Also check for common location patterns like "Greater X Area" or "X Area"
                    if (trimmedLine.includes('Area') ||
                        trimmedLine.includes('Region') ||
                        trimmedLine.includes('Greater')) {
                        location = trimmedLine;
                        console.log(`Found likely location pattern: ${location}`);
                        return location;
                    }
                }
            }
            catch (e) {
                // Ignore errors from text analysis
            }
        }
        catch (e) {
            console.log('Error extracting location');
        }
        return location;
    });
}
// Enhanced summary extraction to handle dynamic class names
function extractSummary(profile) {
    return __awaiter(this, void 0, void 0, function* () {
        let summary = '';
        try {
            console.log('Extracting summary/about...');
            // 1. Try to find elements with summary-like class names
            try {
                const summaryElements = yield profile.findElements(selenium_webdriver_1.By.xpath('.//*[contains(@class, "summary") or contains(@class, "description") or contains(@class, "about")]'));
                for (const element of summaryElements) {
                    const text = yield element.getText();
                    if (text && text.trim() && text.length > 10) {
                        summary = text.trim();
                        // Remove HTML tags if present
                        summary = summary.replace(/<\/?[^>]+(>|$)/g, "");
                        // Remove leading "Current: " if present
                        summary = summary.replace(/^Current:\s+/i, '');
                        console.log(`Extracted summary: ${summary.substring(0, 50)}...`);
                        return summary;
                    }
                }
            }
            catch (e) {
                // Try alternative methods
            }
            // 2. Look for text containing "Current:" which often has summary information
            try {
                const textElements = yield profile.findElements(selenium_webdriver_1.By.xpath('.//*[contains(text(), "Current:")]'));
                for (const element of textElements) {
                    const text = yield element.getText();
                    if (text && text.trim() && text.length > 10) {
                        summary = text.trim();
                        // Clean up formatting
                        summary = summary.replace(/<\/?[^>]+(>|$)/g, "");
                        console.log(`Extracted summary from 'Current:' text: ${summary.substring(0, 50)}...`);
                        return summary;
                    }
                }
            }
            catch (e) {
                // Continue with other methods
            }
            // 3. As a fallback, compose a summary from job title and company if available
            if (!summary) {
                try {
                    const jobResult = yield extractJobDetails(profile);
                    const locationResult = yield extractLocation(profile);
                    if (jobResult.headline) {
                        let composedSummary = jobResult.headline;
                        if (locationResult) {
                            composedSummary += ` - ${locationResult}`;
                        }
                        if (composedSummary) {
                            summary = composedSummary;
                            console.log(`Composed summary from job and location: ${summary}`);
                        }
                    }
                }
                catch (e) {
                    // Ignore errors when composing summary
                }
            }
        }
        catch (e) {
            console.log('Error extracting summary');
        }
        return summary;
    });
}
// Main profile processing section in scrapeLinkedInSearch
// Update to use the enhanced extraction and store all details more reliably
function processProfile(profile, searchUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Processing a LinkedIn profile...');
            // Extract profile URL - if we can't get this, skip the profile
            const profileUrl = yield extractProfileUrl(profile);
            if (!profileUrl) {
                console.log('No profile URL found - skipping profile');
                return null;
            }
            // Extract all profile information with our dynamic-class-friendly functions
            const nameResult = yield extractProfileName(profile);
            const jobResult = yield extractJobDetails(profile);
            const location = yield extractLocation(profile);
            const summary = yield extractSummary(profile);
            // Extract additional info by looking for specific text patterns
            let additionalInfo = '';
            try {
                // Look for "Provides services" or similar insights
                const profileText = yield profile.getText();
                if (profileText.includes('Provides services')) {
                    additionalInfo = 'Provides services';
                }
                else if (profileText.includes('Open to work')) {
                    additionalInfo = 'Open to work';
                }
                // Also check for insight boxes which might contain additional info
                const insightElements = yield profile.findElements(selenium_webdriver_1.By.xpath('.//*[contains(@class, "insight") or contains(@class, "badge")]'));
                const insights = [];
                for (const element of insightElements) {
                    const text = yield element.getText();
                    if (text && text.trim() && text.length < 100) {
                        insights.push(text.trim());
                    }
                }
                if (insights.length > 0) {
                    if (additionalInfo) {
                        additionalInfo += '. ';
                    }
                    additionalInfo += insights.join('. ');
                }
            }
            catch (e) {
                // Ignore errors from additional info extraction
            }
            // Determine profile type
            const isServiceProvider = additionalInfo.includes('Provides services');
            let finalShorthand = nameResult.shorthand;
            let finalName = nameResult.fullName;
            // Service provider gets PS shorthand
            if (isServiceProvider) {
                finalShorthand = 'PS';
                if (nameResult.fullName === 'Unknown Name') {
                    finalName = 'PS';
                }
            }
            // Handle LinkedIn Member profiles
            const isLinkedInMember = nameResult.fullName === 'LinkedIn Member';
            const hasRelevantJobTitle = isLinkedInMember && jobResult.jobTitle && (jobResult.jobTitle.includes('Lead Generation') ||
                jobResult.jobTitle.includes('Brand Consulting') ||
                jobResult.jobTitle.includes('Marketing'));
            // Skip LinkedIn Members without relevant job titles (but keep service providers)
            if (isLinkedInMember && !hasRelevantJobTitle && !isServiceProvider) {
                console.log(`Skipping LinkedIn Member without relevant job title: ${jobResult.jobTitle}`);
                return null;
            }
            // Log the complete profile information
            console.log('---------- Extracted Profile Information ----------');
            console.log(`Name: ${finalName} (${finalShorthand})`);
            console.log(`Headline: ${jobResult.headline}`);
            console.log(`Job Title: ${jobResult.jobTitle}`);
            console.log(`Company: ${jobResult.companyName || 'N/A'}`);
            console.log(`Location: ${location}`);
            console.log(`Profile URL: ${profileUrl}`);
            console.log(`Summary: ${summary.substring(0, 100)}${summary.length > 100 ? '...' : ''}`);
            console.log(`Additional Info: ${additionalInfo}`);
            console.log('--------------------------------------------------');
            // Create the lead data object with all extracted information
            const leadData = {
                fullName: finalName,
                shorthand: finalShorthand,
                headline: jobResult.headline || undefined,
                jobTitle: jobResult.jobTitle || undefined,
                companyName: jobResult.companyName,
                location: location || undefined,
                profileUrl: profileUrl,
                summary: summary || undefined,
                additionalInfo: additionalInfo || undefined,
                sourceUrl: searchUrl,
                scrapedAt: new Date()
            };
            return leadData;
        }
        catch (error) {
            console.error('Error processing profile:', error);
            return null;
        }
    });
}
// Modify the extract profile image function to work with the new approach
function extractProfileImage(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Extracting profile image...');
            // Try multiple selectors for profile images on LinkedIn
            const imageSelectors = [
                // Common LinkedIn profile image selectors
                '.pv-top-card-profile-picture__image',
                '.profile-picture-card__image',
                '.presence-entity__image',
                '.profile-photo-edit__preview',
                // The specific selector from user example
                '.pv-top-card-profile-picture__image--show',
                // More general image selectors
                'img[alt*="profile"]',
                'img[alt*="photo"]',
                // Any image with width >= 150px is likely profile picture
                'img[width="150"], img[width="200"], img[width="300"], img[width="400"]'
            ];
            // Try each selector
            for (const selector of imageSelectors) {
                try {
                    const imageElement = yield driver.findElement(selenium_webdriver_1.By.css(selector));
                    // Get image source
                    const src = yield imageElement.getAttribute('src');
                    if (src && !src.includes('data:image/gif')) {
                        console.log(`Found profile image: ${src.substring(0, 50)}...`);
                        try {
                            // Try to download the image and convert to base64
                            const imageData = yield downloadAndConvertImage(src);
                            if (imageData) {
                                return imageData;
                            }
                        }
                        catch (downloadError) {
                            console.error('Error downloading image:', downloadError);
                            // If download fails, still return the URL
                            return src;
                        }
                    }
                }
                catch (e) {
                    // Continue to next selector
                }
            }
            // Try using XPath as a fallback - look for any img with alt containing the profile name
            try {
                const profileName = yield extractNameWithSelectors(driver);
                if (profileName && profileName !== 'Unknown Name') {
                    // Try to find an image with alt text matching profile name
                    const imageElement = yield driver.findElement(selenium_webdriver_1.By.xpath(`//img[contains(@alt, '${profileName}')]`));
                    const src = yield imageElement.getAttribute('src');
                    if (src) {
                        console.log(`Found profile image by name match: ${src.substring(0, 50)}...`);
                        try {
                            // Try to download the image and convert to base64
                            const imageData = yield downloadAndConvertImage(src);
                            if (imageData) {
                                return imageData;
                            }
                        }
                        catch (downloadError) {
                            console.error('Error downloading image:', downloadError);
                            // If download fails, still return the URL
                            return src;
                        }
                    }
                }
            }
            catch (e) {
                // Ignore errors with this approach
            }
            // If image not found, take a screenshot of the top part of profile as fallback
            try {
                console.log('No profile image found, taking screenshot of profile top area as fallback');
                // Find the top card or header area
                const topCardElement = yield driver.findElement(selenium_webdriver_1.By.css('.pv-top-card, .profile-topcard, .ph5.pb5'));
                // Take screenshot of the element
                const screenshot = yield topCardElement.takeScreenshot();
                if (screenshot) {
                    // We can directly return this as it's already base64 encoded
                    return `data:image/png;base64,${screenshot}`;
                }
            }
            catch (e) {
                console.log('Could not take element screenshot:', e);
            }
            console.log('No profile image found');
            return null;
        }
        catch (error) {
            console.error('Error extracting profile image:', error);
            return null;
        }
    });
}
// Helper function to download an image and convert it to base64
function downloadAndConvertImage(imageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Use node-fetch to download the image
            const fetch = yield Promise.resolve().then(() => __importStar(require('node-fetch'))).then(mod => mod.default);
            const response = yield fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            // Get the image as buffer
            const imageBuffer = yield response.buffer();
            // Convert to base64
            const base64Image = imageBuffer.toString('base64');
            // Get content type from response headers or default to image/jpeg
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            // Return the data URL
            return `data:${contentType};base64,${base64Image}`;
        }
        catch (error) {
            console.error('Error downloading image:', error);
            return null;
        }
    });
}
// New function to extract About section using direct selectors
function extractAboutWithSelectors(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Extracting About section...');
            // Try using the exact selector path provided by the user
            try {
                // This is the exact selector path for the about content from user's example
                const aboutElement = yield driver.findElement(selenium_webdriver_1.By.css('div.display-flex.ph5.pv3 > div > div > div.tWtBdkUaFQqyhrVteWWLwSbzeuDTNTSGOQyzQ'));
                // Get the text directly from the span that contains the actual content
                try {
                    const spanElement = yield aboutElement.findElement(selenium_webdriver_1.By.css('span[aria-hidden="true"]'));
                    const aboutText = yield spanElement.getText();
                    if (aboutText && aboutText.trim()) {
                        // Clean up the text - remove HTML comments and excessive whitespace
                        let cleanedText = aboutText.replace(/<!---->/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                        console.log(`Extracted About section content: ${cleanedText.substring(0, 100)}...`);
                        return cleanedText;
                    }
                }
                catch (e) {
                    console.log('Failed to extract span element inside About section, trying direct text extraction');
                    // Alternative approach - get text directly from the container
                    const aboutText = yield aboutElement.getText();
                    if (aboutText && aboutText.trim()) {
                        const cleanedText = aboutText.replace(/<!---->/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                        console.log(`Extracted About section with direct approach: ${cleanedText.substring(0, 100)}...`);
                        return cleanedText;
                    }
                }
            }
            catch (e) {
                console.log('Failed to find About section with exact selector, trying alternatives');
            }
            // Try using the aria-hidden="true" span in any inline-show-more-text element
            try {
                const spanElement = yield driver.findElement(selenium_webdriver_1.By.css('.inline-show-more-text--is-collapsed span[aria-hidden="true"]'));
                const aboutText = yield spanElement.getText();
                if (aboutText && aboutText.trim()) {
                    const cleanedText = aboutText.replace(/<!---->/g, '')
                        .replace(/\s+/g, ' ')
                        .trim();
                    console.log(`Extracted About section from span element: ${cleanedText.substring(0, 100)}...`);
                    return cleanedText;
                }
            }
            catch (e) {
                console.log('Failed to extract About section from span element, trying fallback methods');
            }
            // Try to locate the About section by section ordering
            try {
                // Look for the second section in the main profile content
                const aboutSection = yield driver.findElement(selenium_webdriver_1.By.css('main > section:nth-child(2)'));
                // Check if this section has "About" in its text
                const sectionText = yield aboutSection.getText();
                if (sectionText.includes('About')) {
                    // Try to find the content below the "About" heading
                    const contentText = sectionText.substring(sectionText.indexOf('About') + 5).trim();
                    if (contentText && contentText.length > 20) {
                        const cleanedText = contentText.replace(/<!---->/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                        console.log(`Extracted About section from section text: ${cleanedText.substring(0, 100)}...`);
                        return cleanedText;
                    }
                }
            }
            catch (e) {
                console.log('Failed to extract About section from profile sections');
            }
            // Fall back to previous approaches if all above fail
            // Fallback selectors if the specific ones don't work
            const aboutSelectors = [
                // Various possible selectors for the about section
                '.pv-about__summary-text',
                '.inline-show-more-text',
                '.about-summary',
                '.pv-shared-text-with-see-more',
                '.profile-section-card__contents',
                // General text container after About heading
                'section div.display-flex.ph5.pv3 div'
            ];
            for (const selector of aboutSelectors) {
                try {
                    const element = yield driver.findElement(selenium_webdriver_1.By.css(selector));
                    const text = yield element.getText();
                    if (text && text.trim() && text.length > 20) { // Ensure we have meaningful content
                        // Clean up the text
                        const cleanedText = text.replace(/<!---->/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                        console.log(`Extracted About with fallback selector ${selector}: ${cleanedText.substring(0, 100)}...`);
                        return cleanedText;
                    }
                }
                catch (e) {
                    // Continue to next selector
                }
            }
            return '';
        }
        catch (error) {
            console.error('Error extracting About section:', error);
            return '';
        }
    });
}
// Get a shortened version of the about text for display
function getAboutSummary(about, maxLength = 200) {
    if (!about)
        return '';
    if (about.length <= maxLength) {
        return about;
    }
    // Find the nearest period or line break within the limit to make a clean cutoff
    const truncated = about.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastLineBreak = truncated.lastIndexOf('\n');
    // Use the later of period or line break for a natural cutoff point
    const cutoffPoint = Math.max(lastPeriod, lastLineBreak);
    if (cutoffPoint > maxLength * 0.5) { // Only use if it's reasonably far into the text
        return about.substring(0, cutoffPoint + 1) + '...';
    }
    else {
        // Just cut at maxLength if no good breakpoint found
        return truncated + '...';
    }
}
// Update the scrapeFullProfile function to include about data extraction
function scrapeFullProfile(driver, profileUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Navigating to full profile: ${profileUrl}`);
            // Navigate to the profile URL
            yield driver.get(profileUrl);
            // Give the page enough time to load
            yield delay(5000);
            // Extract data using direct CSS selectors
            const fullName = yield extractNameWithSelectors(driver);
            const headline = yield extractHeadlineWithSelectors(driver);
            const location = yield extractLocationWithSelectors(driver);
            const { jobTitle, companyName } = yield extractJobDetailsWithSelectors(driver);
            // Extract the about section
            const about = yield extractAboutWithSelectors(driver);
            // Generate a summary version for display
            const aboutSummary = getAboutSummary(about);
            // Only take screenshot for profile image
            const profileImage = yield extractProfileImage(driver);
            console.log('---------- Full Profile Data Extracted ----------');
            console.log(`Name: ${fullName}`);
            console.log(`Headline: ${headline}`);
            console.log(`Job Title: ${jobTitle}`);
            console.log(`Company: ${companyName || 'N/A'}`);
            console.log(`Location: ${location}`);
            console.log(`Image: ${profileImage ? 'Found' : 'Not found'}`);
            console.log(`About: ${aboutSummary ? (aboutSummary.substring(0, 100) + '...') : 'N/A'}`);
            console.log('------------------------------------------------');
            // Determine shorthand code based on name
            const shorthand = fullName === 'LinkedIn Member' ? 'LM' :
                fullName === 'Unknown Name' ? 'UN' : 'RN';
            // Return the extracted lead data
            return {
                fullName,
                shorthand,
                headline: headline || undefined,
                jobTitle: jobTitle || undefined,
                companyName: companyName || undefined,
                location: location || undefined,
                profileUrl,
                profileImage: profileImage || undefined,
                summary: about || undefined, // Store the full about text in DB
                additionalInfo: aboutSummary || undefined, // Store a shortened version in additionalInfo
                scrapedAt: new Date()
            };
        }
        catch (error) {
            console.error('Error navigating to full profile:', error);
            return null;
        }
    });
}
// Extract profile name using direct selectors
function extractNameWithSelectors(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Try the specific selector provided
            try {
                const nameElement = yield driver.findElement(selenium_webdriver_1.By.css('h1.inline.t-24'));
                const name = yield nameElement.getText();
                if (name && name.trim()) {
                    console.log(`Extracted name using selector: ${name}`);
                    return name.trim();
                }
            }
            catch (e) {
                console.log('Failed to extract name with specific selector, trying alternate selectors');
            }
            // Fallback selectors
            const nameSelectors = [
                'h1.text-heading-xlarge',
                'h1.inline.t-24',
                '.pv-top-card--list h1',
                '.ph5.pb5 h1',
                'h1[data-generated-type="title"]'
            ];
            for (const selector of nameSelectors) {
                try {
                    const nameElement = yield driver.findElement(selenium_webdriver_1.By.css(selector));
                    const name = yield nameElement.getText();
                    if (name && name.trim()) {
                        console.log(`Extracted name with fallback selector ${selector}: ${name}`);
                        return name.trim();
                    }
                }
                catch (e) {
                    // Continue to next selector
                }
            }
            console.log('Could not extract name from profile');
            return 'Unknown Name';
        }
        catch (error) {
            console.error('Error extracting profile name:', error);
            return 'Unknown Name';
        }
    });
}
// Extract headline using direct selectors
function extractHeadlineWithSelectors(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Try the specific selector provided
            try {
                const headlineElement = yield driver.findElement(selenium_webdriver_1.By.css('div.text-body-medium.break-words'));
                const headline = yield headlineElement.getText();
                if (headline && headline.trim()) {
                    console.log(`Extracted headline using specific selector: ${headline}`);
                    return headline.trim();
                }
            }
            catch (e) {
                console.log('Failed to extract headline with specific selector, trying alternate selectors');
            }
            // Fallback selectors
            const headlineSelectors = [
                '.text-body-medium',
                '.pv-top-card--list-bullet',
                '.ph5.pb5 .text-body-medium',
                '.profile-topcard__current-role'
            ];
            for (const selector of headlineSelectors) {
                try {
                    const element = yield driver.findElement(selenium_webdriver_1.By.css(selector));
                    const text = yield element.getText();
                    if (text && text.trim()) {
                        console.log(`Extracted headline with fallback selector ${selector}: ${text}`);
                        return text.trim();
                    }
                }
                catch (e) {
                    // Continue to next selector
                }
            }
            return '';
        }
        catch (error) {
            console.error('Error extracting headline:', error);
            return '';
        }
    });
}
// Extract location using direct selectors
function extractLocationWithSelectors(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Try the specific selector provided
            try {
                const locationElement = yield driver.findElement(selenium_webdriver_1.By.css('span.text-body-small.inline.t-black--light.break-words'));
                const location = yield locationElement.getText();
                if (location && location.trim() && !location.includes('followers') && !location.includes('connections')) {
                    console.log(`Extracted location using specific selector: ${location}`);
                    return location.trim();
                }
            }
            catch (e) {
                console.log('Failed to extract location with specific selector, trying alternate selectors');
            }
            // Fallback selectors
            const locationSelectors = [
                '.pv-top-card--list-bullet .t-16',
                '.pv-top-card--list-bullet .inline-block',
                '.ph5.pb5 .text-body-small',
                '.profile-topcard__location-data'
            ];
            for (const selector of locationSelectors) {
                try {
                    const element = yield driver.findElement(selenium_webdriver_1.By.css(selector));
                    const text = yield element.getText();
                    if (text && text.trim() && !text.includes('followers') && !text.includes('connections')) {
                        console.log(`Extracted location with fallback selector ${selector}: ${text}`);
                        return text.trim();
                    }
                }
                catch (e) {
                    // Continue to next selector
                }
            }
            return '';
        }
        catch (error) {
            console.error('Error extracting location:', error);
            return '';
        }
    });
}
// Extract job details using direct selectors
function extractJobDetailsWithSelectors(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        let jobTitle = '';
        let companyName = undefined;
        try {
            console.log('Extracting job details with specific selectors...');
            // 1. First try to find the Experience section heading
            try {
                const experienceHeading = yield driver.findElement(selenium_webdriver_1.By.xpath('//span[@aria-hidden="true" and contains(text(), "Experience")]'));
                console.log('Found Experience section heading');
                // If we found the Experience heading, look for job title and company name within this section
                // 2. Try to extract job title - specific selector from the example
                try {
                    // Look for the bold job title text under the Experience section
                    const jobTitleElement = yield driver.findElement(selenium_webdriver_1.By.css('div.display-flex.align-items-center.mr1.hoverable-link-text.t-bold > span[aria-hidden="true"]'));
                    const title = yield jobTitleElement.getText();
                    if (title && title.trim()) {
                        // Remove any HTML comments that might be captured
                        jobTitle = title.trim().replace(/<!---->/g, '');
                        console.log(`Extracted job title using specific selector: ${jobTitle}`);
                    }
                }
                catch (e) {
                    console.log('Failed to extract job title with specific selector, will try alternates');
                }
                // 3. Try to extract company name - specific selector from the example
                try {
                    // Find the company name in the t-14 t-normal span
                    const companyElement = yield driver.findElement(selenium_webdriver_1.By.css('span.t-14.t-normal > span[aria-hidden="true"]'));
                    const companyText = yield companyElement.getText();
                    if (companyText && companyText.trim()) {
                        // Remove HTML comments and extract just the company part before any "·" character
                        let processedText = companyText.trim().replace(/<!---->/g, '');
                        // If there's a "·" character, extract just the company name
                        if (processedText.includes('·')) {
                            companyName = processedText.split('·')[0].trim();
                        }
                        else {
                            companyName = processedText;
                        }
                        console.log(`Extracted company name using specific selector: ${companyName}`);
                    }
                }
                catch (e) {
                    console.log('Failed to extract company with specific selector, will try alternates');
                }
            }
            catch (e) {
                console.log('Could not find Experience section heading, trying general selectors');
            }
            // If we couldn't extract job title using the specific selectors, use alternative approaches
            if (!jobTitle) {
                // Try alternative selectors for job title
                const jobTitleSelectors = [
                    // General selector for any "bold" job title
                    '.t-bold span[aria-hidden="true"]',
                    // Inside any experience section
                    'section li .t-bold span[aria-hidden="true"]',
                    // Using the job title classes
                    '.pv-entity__summary-info h3',
                    '.pv-entity__position-info h3'
                ];
                for (const selector of jobTitleSelectors) {
                    try {
                        const element = yield driver.findElement(selenium_webdriver_1.By.css(selector));
                        const text = yield element.getText();
                        if (text && text.trim()) {
                            jobTitle = text.trim().replace(/<!---->/g, '');
                            console.log(`Extracted job title with fallback selector ${selector}: ${jobTitle}`);
                            break;
                        }
                    }
                    catch (e) {
                        // Continue to next selector
                    }
                }
            }
            // If we couldn't extract company name using the specific selectors, use alternative approaches
            if (!companyName) {
                // Try alternative selectors for company name
                const companySelectors = [
                    // Look for spans containing company names
                    'span.t-14.t-normal',
                    // Standard company details selectors
                    '.pv-entity__secondary-title',
                    '.pv-entity__company-details'
                ];
                for (const selector of companySelectors) {
                    try {
                        const element = yield driver.findElement(selenium_webdriver_1.By.css(selector));
                        const text = yield element.getText();
                        if (text && text.trim()) {
                            // Clean up and extract company name
                            let processedText = text.trim().replace(/<!---->/g, '');
                            // If there's a "·" character, extract just the company name
                            if (processedText.includes('·')) {
                                companyName = processedText.split('·')[0].trim();
                            }
                            else {
                                companyName = processedText;
                            }
                            console.log(`Extracted company name with fallback selector ${selector}: ${companyName}`);
                            break;
                        }
                    }
                    catch (e) {
                        // Continue to next selector
                    }
                }
            }
            // If we still have no job title from selectors, try to extract from headline
            if (!jobTitle) {
                const headline = yield extractHeadlineWithSelectors(driver);
                if (headline && headline.includes(' at ')) {
                    const parts = headline.split(' at ');
                    jobTitle = parts[0].trim();
                    console.log(`Extracted job title from headline: ${jobTitle}`);
                    // If no company name yet, extract from headline too
                    if (!companyName && parts.length > 1) {
                        companyName = parts[1].trim();
                        // If company has additional text, extract just the company name
                        if (companyName.includes('·')) {
                            companyName = companyName.split('·')[0].trim();
                        }
                        console.log(`Extracted company name from headline: ${companyName}`);
                    }
                }
            }
        }
        catch (error) {
            console.error('Error extracting job details:', error);
        }
        return { jobTitle, companyName };
    });
}
// Add a helper function to delete screenshots and debug files
function cleanupDebugFiles() {
    console.log('Cleaning up debug files and screenshots...');
    const debugFiles = [
        'verification-debug.png',
        'after-verification.png',
        'verification-page.html',
        'login-error.html',
        'profile-debug-*.png',
        'search-page.png',
        'no-results-debug.png',
        'login-redirect.png',
        'page-html-debug.html',
        'page-content.html'
    ];
    // Delete each debug file
    debugFiles.forEach(filePattern => {
        try {
            // If the filename contains a wildcard, use glob to match multiple files
            if (filePattern.includes('*')) {
                const glob = require('glob');
                const matchingFiles = glob.sync(filePattern);
                matchingFiles.forEach((file) => {
                    fs_1.default.unlinkSync(file);
                    console.log(`Deleted debug file: ${file}`);
                });
            }
            else {
                // Check if file exists before attempting to delete
                if (fs_1.default.existsSync(filePattern)) {
                    fs_1.default.unlinkSync(filePattern);
                    console.log(`Deleted debug file: ${filePattern}`);
                }
            }
        }
        catch (error) {
            console.error(`Error deleting debug file ${filePattern}:`, error);
        }
    });
}
// Add a helper function to handle inaccessible profile dialogs
function handleAccessRestrictionDialog(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Look for the "You don't have access" dialog
            const restrictionDialogs = yield driver.findElements(selenium_webdriver_1.By.xpath(`//div[contains(text(), "You don't have access to this profile") or contains(text(), "This profile is not available")]`));
            if (restrictionDialogs.length > 0) {
                console.log('Access restriction dialog detected');
                // Try to find and click the "Got it" button
                const gotItButtons = yield driver.findElements(selenium_webdriver_1.By.xpath(`//button[contains(text(), "Got it") or contains(text(), "Okay") or contains(text(), "OK")]`));
                if (gotItButtons.length > 0) {
                    console.log('Clicking "Got it" button');
                    yield gotItButtons[0].click();
                    yield delay(1000);
                    return true;
                }
                else {
                    // Try clicking the generic close button if "Got it" is not found
                    const closeButtons = yield driver.findElements(selenium_webdriver_1.By.css(".artdeco-modal__dismiss, .artdeco-toast-item__dismiss"));
                    if (closeButtons.length > 0) {
                        console.log('Clicking close button on dialog');
                        yield closeButtons[0].click();
                        yield delay(1000);
                        return true;
                    }
                }
            }
            return false; // No dialog found
        }
        catch (error) {
            console.log('Error checking for access restriction dialog:', error);
            return false;
        }
    });
}
// Improved goToNextPage function with specific selectors for LinkedIn pagination
function goToNextPage(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Attempting to go to the next page...');
            // First check if we're on the last page (Next button is disabled)
            const disabledNextButtons = yield driver.findElements(selenium_webdriver_1.By.css('button.artdeco-pagination__button--next.artdeco-button--disabled'));
            if (disabledNextButtons.length > 0) {
                console.log('Next button is disabled - already on the last page');
                return false;
            }
            // Save current URL before clicking next
            const currentUrl = yield driver.getCurrentUrl();
            console.log(`Current URL before pagination: ${currentUrl}`);
            // Take a screenshot before clicking for debugging
            yield driver.takeScreenshot().then((data) => {
                fs_1.default.writeFileSync('before-next-click.png', data, 'base64');
                console.log('Screenshot saved before clicking Next button');
            });
            // APPROACH 1: Try finding the Next button by its ID pattern or directly by aria-label
            let nextButtonFound = false;
            let nextButton;
            try {
                // First try finding by exact button attributes - most reliable
                nextButton = yield driver.findElement(selenium_webdriver_1.By.css('button[aria-label="Next"].artdeco-pagination__button--next'));
                nextButtonFound = true;
                console.log('Found Next button by aria-label and class');
            }
            catch (e) {
                console.log('Next button not found by aria-label and class, trying other methods');
            }
            // If button not found, try the ember ID pattern
            if (!nextButtonFound) {
                try {
                    // Find the pagination div first
                    const paginationDiv = yield driver.findElement(selenium_webdriver_1.By.css('div.artdeco-pagination'));
                    // Then find the Next button within it
                    nextButton = yield paginationDiv.findElement(selenium_webdriver_1.By.css('button.artdeco-pagination__button--next'));
                    nextButtonFound = true;
                    console.log('Found Next button within pagination div');
                }
                catch (e) {
                    console.log('Next button not found within pagination div');
                }
            }
            // APPROACH 2: If still not found, try finding by XPath with text "Next"
            if (!nextButtonFound) {
                try {
                    nextButton = yield driver.findElement(selenium_webdriver_1.By.xpath('//button[contains(@class, "artdeco-pagination__button--next") or .//span[text()="Next"]]'));
                    nextButtonFound = true;
                    console.log('Found Next button by XPath with text');
                }
                catch (e) {
                    console.log('Next button not found by XPath with text');
                }
            }
            // APPROACH 3: Try finding by direct page number navigation
            if (!nextButtonFound) {
                try {
                    const activePageElements = yield driver.findElements(selenium_webdriver_1.By.css('li.artdeco-pagination__indicator--number.active, li.artdeco-pagination__indicator--number.selected'));
                    if (activePageElements.length > 0) {
                        const activePageElement = activePageElements[0];
                        // Get the current page number
                        const pageButton = yield activePageElement.findElement(selenium_webdriver_1.By.css('button'));
                        const pageText = yield pageButton.getText();
                        const currentPageNum = parseInt(pageText.trim());
                        console.log(`Current page number is ${currentPageNum}`);
                        // Find the button for the next page
                        const nextPageSelector = `li[data-test-pagination-page-btn="${currentPageNum + 1}"] button`;
                        nextButton = yield driver.findElement(selenium_webdriver_1.By.css(nextPageSelector));
                        nextButtonFound = true;
                        console.log(`Found next page (${currentPageNum + 1}) button`);
                    }
                }
                catch (e) {
                    console.log('Could not find or navigate by page numbers');
                }
            }
            // APPROACH 4: URL manipulation as last resort
            if (!nextButtonFound) {
                try {
                    const url = new URL(currentUrl);
                    const pageParam = url.searchParams.get('page');
                    const currentPageNum = pageParam ? parseInt(pageParam) : 1;
                    const nextPageNum = currentPageNum + 1;
                    url.searchParams.set('page', nextPageNum.toString());
                    const nextPageUrl = url.toString();
                    console.log(`Next button not found, attempting URL manipulation: ${nextPageUrl}`);
                    yield driver.get(nextPageUrl);
                    // Wait for page to load
                    yield delay(3000);
                    // Verify if page changed
                    const newUrl = yield driver.getCurrentUrl();
                    if (newUrl !== currentUrl) {
                        console.log(`Successfully navigated to page ${nextPageNum} via URL manipulation`);
                        // Scroll down to load more results
                        for (let i = 0; i < 5; i++) {
                            yield driver.executeScript(`window.scrollTo(0, ${(i + 1) * 1000});`);
                            yield delay(500);
                        }
                        return true;
                    }
                    else {
                        console.log('URL manipulation failed, pagination not possible');
                        return false;
                    }
                }
                catch (e) {
                    console.log('Error during URL manipulation:', e);
                }
                console.log('All pagination methods failed');
                return false;
            }
            // If we've found a next button, click it
            if (nextButtonFound && nextButton) {
                console.log('Clicking Next button');
                // Sometimes the button might be outside viewport, scroll to it first
                yield driver.executeScript("arguments[0].scrollIntoView(true);", nextButton);
                yield delay(500);
                // Click the button
                yield nextButton.click();
                // Wait for navigation to complete
                yield delay(5000);
                // Verify navigation worked by checking URL changed
                const newUrl = yield driver.getCurrentUrl();
                if (newUrl !== currentUrl) {
                    console.log('URL changed after clicking Next - pagination successful');
                    // Take a screenshot after clicking for debugging
                    yield driver.takeScreenshot().then((data) => {
                        fs_1.default.writeFileSync('after-next-click.png', data, 'base64');
                    });
                    // Scroll down to load more results
                    for (let i = 0; i < 5; i++) {
                        yield driver.executeScript(`window.scrollTo(0, ${(i + 1) * 1000});`);
                        yield delay(500);
                    }
                    return true;
                }
                else {
                    // If URL didn't change, check if content changed
                    try {
                        // Wait for search results container to refresh
                        yield driver.wait(selenium_webdriver_1.until.stalenessOf(yield driver.findElement(selenium_webdriver_1.By.css('.search-results-container'))), 5000);
                        console.log('Content refreshed, pagination likely successful');
                        return true;
                    }
                    catch (e) {
                        console.log('Content did not refresh, trying one more approach...');
                        // One last check - try to verify page number changed in pagination text
                        try {
                            const paginationText = yield driver.findElement(selenium_webdriver_1.By.css('.artdeco-pagination__page-state')).getText();
                            if (paginationText.includes('Page ')) {
                                const matches = paginationText.match(/Page (\d+) of/);
                                if (matches && matches[1]) {
                                    const newPageNum = parseInt(matches[1]);
                                    // Get the old page number from the screenshot filename or currentUrl
                                    const oldPageMatches = currentUrl.match(/page=(\d+)/) || ['', '1'];
                                    const oldPageNum = parseInt(oldPageMatches[1]);
                                    if (newPageNum > oldPageNum) {
                                        console.log(`Page number changed from ${oldPageNum} to ${newPageNum} - pagination successful`);
                                        return true;
                                    }
                                }
                            }
                        }
                        catch (e) {
                            // Last check failed
                        }
                        console.log('Pagination verification failed');
                        return false;
                    }
                }
            }
            return false;
        }
        catch (error) {
            console.error('Error navigating to next page:', error);
            return false;
        }
    });
}
// Update the main function to accept credentials
function scrapeLinkedInSearch(searchUrl_1) {
    return __awaiter(this, arguments, void 0, function* (searchUrl, maxProfiles = 5, linkedinEmail, linkedinPassword) {
        var _a;
        let driver = null;
        const scrapedLeads = [];
        const processedUrls = new Set(); // Track processed URLs
        const processedProfiles = new Set(); // Track processed profiles by name+company
        let currentPage = 1;
        try {
            console.log('Launching browser...');
            // Browser setup code (unchanged)
            const options = new chrome_1.default.Options();
            options.addArguments('--no-sandbox');
            options.addArguments('--disable-dev-shm-usage');
            options.addArguments('--disable-blink-features=AutomationControlled');
            options.addArguments('--disable-extensions');
            options.addArguments('--window-size=1920,1080');
            options.addArguments('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
            options.excludeSwitches('enable-automation');
            options.setUserPreferences({
                'credentials_enable_service': false,
                'profile.password_manager_enabled': false
            });
            // Launch browser
            driver = yield new selenium_webdriver_1.Builder()
                .forBrowser('chrome')
                .setChromeOptions(options)
                .build();
            // Set timeouts
            yield driver.manage().setTimeouts({
                implicit: 10000,
                pageLoad: 60000,
                script: 60000
            });
            // Pass the credentials to the login handler
            console.log('Login required. Handling login...');
            const loginSuccess = yield handleLogin(driver, linkedinEmail, linkedinPassword);
            if (!loginSuccess) {
                throw new Error('Failed to log in to LinkedIn. Please check your credentials.');
            }
            yield delay(5000); // Pause after login
            // Navigate to the initial search URL
            console.log(`Navigating to initial search URL: ${searchUrl}`);
            yield driver.get(searchUrl);
            yield delay(5000);
            // Main pagination loop - continue until we reach maxProfiles
            while (scrapedLeads.length < maxProfiles) {
                console.log(`Processing search results page ${currentPage}`);
                // Scroll down to load all results on the current page
                for (let i = 0; i < 5; i++) {
                    yield driver.executeScript(`window.scrollTo(0, ${(i + 1) * 1000});`);
                    yield delay(1000);
                }
                // Save current page content for debugging
                const pageContent = yield driver.getPageSource();
                fs_1.default.writeFileSync(`page-content-${currentPage}.html`, pageContent);
                // Collect profile links from the current page
                console.log(`Collecting profile links from page ${currentPage}...`);
                const pageProfileLinks = [];
                const allLinks = yield driver.findElements(selenium_webdriver_1.By.css('a[href*="/in/"]'));
                for (const link of allLinks) {
                    try {
                        const href = yield link.getAttribute('href');
                        if (href && href.includes('/in/')) {
                            // Clean the URL and add it to the list if not already processed
                            try {
                                const url = new URL(href);
                                if (url.pathname.startsWith('/in/')) {
                                    const cleanUrl = `https://www.linkedin.com${url.pathname}`;
                                    // Only add if we haven't processed this URL before
                                    if (!processedUrls.has(cleanUrl) && !pageProfileLinks.includes(cleanUrl)) {
                                        pageProfileLinks.push(cleanUrl);
                                        console.log(`Found profile link: ${cleanUrl}`);
                                    }
                                }
                            }
                            catch (e) {
                                // If URL parsing fails, use the original URL
                                if (!processedUrls.has(href) && !pageProfileLinks.includes(href)) {
                                    pageProfileLinks.push(href);
                                }
                            }
                        }
                    }
                    catch (e) {
                        // Ignore errors for individual links
                    }
                }
                console.log(`Found ${pageProfileLinks.length} new profile links on page ${currentPage}`);
                // Process profiles from the current page
                for (const profileUrl of pageProfileLinks) {
                    // Skip if we've already reached the max profiles
                    if (scrapedLeads.length >= maxProfiles) {
                        console.log(`Reached target of ${maxProfiles} profiles. Stopping.`);
                        break;
                    }
                    // Mark URL as processed to avoid visiting the same URL twice
                    processedUrls.add(profileUrl);
                    try {
                        console.log(`Processing profile: ${profileUrl}`);
                        // Navigate to the profile and scrape data
                        yield driver.get(profileUrl);
                        yield delay(3000);
                        // Check if we have access to this profile or if there's a dialog
                        const dialogHandled = yield handleAccessRestrictionDialog(driver);
                        if (dialogHandled) {
                            console.log('Access restriction handled. Skipping to next profile.');
                            continue;
                        }
                        // Scrape the profile
                        const leadData = yield scrapeFullProfile(driver, profileUrl);
                        if (leadData) {
                            // Add the source URL to the lead
                            leadData.sourceUrl = searchUrl;
                            // Create a unique identifier for this profile (name + company)
                            const profileIdentifier = `${leadData.fullName}~${leadData.companyName || ''}`;
                            // Skip if we've already processed this profile (based on name+company)
                            if (processedProfiles.has(profileIdentifier)) {
                                console.log(`Skipping duplicate profile: ${leadData.fullName} at ${leadData.companyName || 'unknown company'}`);
                                continue;
                            }
                            // Mark this profile as processed
                            processedProfiles.add(profileIdentifier);
                            // Skip LinkedIn Member profiles unless they have relevant data
                            if (leadData.fullName !== 'LinkedIn Member' || ((_a = leadData.jobTitle) === null || _a === void 0 ? void 0 : _a.includes('Lead Generation'))) {
                                scrapedLeads.push(leadData);
                                console.log(`Added profile to leads: ${leadData.fullName} (${scrapedLeads.length}/${maxProfiles})`);
                            }
                        }
                        // Add a delay between profile visits to avoid rate limiting
                        yield delay(2000);
                    }
                    catch (error) {
                        console.error(`Error processing profile ${profileUrl}:`, error);
                    }
                }
                // Go to the next page if we need more profiles
                if (scrapedLeads.length < maxProfiles) {
                    console.log(`Need more profiles (${scrapedLeads.length}/${maxProfiles}). Trying next page.`);
                    // Return to search results page if we're on a profile page
                    const currentUrl = yield driver.getCurrentUrl();
                    if (currentUrl !== searchUrl && !currentUrl.includes('search/results')) {
                        console.log('Navigating back to search results page');
                        yield driver.get(searchUrl);
                        yield delay(3000);
                        // If we need to go to a specific page (not the first)
                        if (currentPage > 1) {
                            console.log(`Need to navigate to page ${currentPage} before going to next page`);
                            // This is simplified - in a real implementation you'd need to click through to the right page
                            // For now, we'll just try to go to next page from wherever we are
                        }
                    }
                    const hasNextPage = yield goToNextPage(driver);
                    if (!hasNextPage) {
                        console.log('No more pages available. Ending search.');
                        break;
                    }
                    currentPage++;
                    yield delay(3000); // Wait between page navigation
                }
                else {
                    // We have enough profiles
                    break;
                }
            }
            console.log(`Scraping finished. Collected ${scrapedLeads.length} unique profiles from ${currentPage} pages.`);
            // Database operations code remains largely the same
            if (scrapedLeads.length > 0) {
                console.log('Saving leads to database...');
                // Ensure all profiles have valid URLs to prevent errors
                for (const lead of scrapedLeads) {
                    if (!lead.profileUrl || lead.profileUrl === '') {
                        lead.profileUrl = `https://www.linkedin.com/dummy/${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
                    }
                }
                try {
                    // Use bulkWrite with updateOne and upsert for multiple leads
                    const operations = scrapedLeads.map(lead => ({
                        updateOne: {
                            filter: {
                                // Use a combination of name + company for uniqueness, not just URL
                                $and: [
                                    { profileUrl: lead.profileUrl },
                                    { fullName: lead.fullName }
                                ]
                            },
                            update: { $set: lead },
                            upsert: true
                        }
                    }));
                    yield Lead_1.default.bulkWrite(operations);
                    console.log(`Saved/Updated ${scrapedLeads.length} leads from ${searchUrl}.`);
                }
                catch (error) {
                    // Handle duplicate key errors
                    const mongoError = error;
                    if (mongoError.code === 11000) {
                        console.log('Encountered duplicate key error. Trying alternative approach...');
                        // Try inserting leads one by one to handle duplicates
                        for (const lead of scrapedLeads) {
                            try {
                                yield Lead_1.default.updateOne({
                                    $and: [
                                        { profileUrl: lead.profileUrl },
                                        { fullName: lead.fullName }
                                    ]
                                }, { $set: lead }, { upsert: true });
                                console.log(`Successfully saved/updated lead: ${lead.fullName}`);
                            }
                            catch (innerError) {
                                console.error(`Failed to save lead ${lead.fullName}: ${innerError instanceof Error ? innerError.message : String(innerError)}`);
                            }
                        }
                    }
                    else {
                        console.error('Error saving leads:', mongoError);
                    }
                }
            }
            return scrapedLeads;
        }
        catch (error) {
            console.error('Error during scraping process:', error);
            throw error;
        }
        finally {
            if (driver) {
                console.log('Closing browser...');
                yield driver.quit();
            }
            // Clean up debug files
            cleanupDebugFiles();
        }
    });
}
function getAllLeads() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Fetching all leads from database...');
        try {
            const leads = yield Lead_1.default.find().sort({ scrapedAt: -1 }); // Sort by most recent
            console.log(`Found ${leads.length} leads.`);
            return leads;
        }
        catch (error) {
            console.error('Error fetching leads:', error);
            throw error;
        }
    });
}
function getSourceUrls() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Fetching distinct source URLs...');
        try {
            const sourceUrls = yield Lead_1.default.distinct('sourceUrl');
            console.log(`Found ${sourceUrls.length} distinct source URLs.`);
            return sourceUrls;
        }
        catch (error) {
            console.error('Error fetching source URLs:', error);
            throw error;
        }
    });
}
// Get leads by source URL
function getLeadsBySourceUrl(sourceUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Fetching leads from source URL: ${sourceUrl}`);
        try {
            const leads = yield Lead_1.default.find({ sourceUrl }).sort({ scrapedAt: -1 });
            console.log(`Found ${leads.length} leads from source URL: ${sourceUrl}`);
            return leads;
        }
        catch (error) {
            console.error(`Error fetching leads from source URL ${sourceUrl}:`, error);
            throw error;
        }
    });
}
exports.ScraperService = {
    scrapeLinkedInSearch,
    getAllLeads,
    getSourceUrls,
    getLeadsBySourceUrl
};
