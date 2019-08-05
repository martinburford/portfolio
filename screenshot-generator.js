const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const fs = require('fs');
const rimraf = require('rimraf');

const projectToScreenshot = 'lloyds.styleguide';
const projectsAndPages = {

    // Lloyds (styleguide)
    'lloyds.styleguide': {
        breakpoints: ['desktop'],
        pages: [{
            name: 'sample-component',
            url: 'http://localhost:3001'
        }]
    },

    // Lloyds (BoS branding)
    'lloyds.sca.bos': {
        breakpoints: ['mobile','tablet','desktop'],
        pages: [{
            name: 'user-id',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/user-id'
        },{
            name: 'mi',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/mi'
        },{
            name: 'continue-with-token',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/continue-with-token'
        },{
            name: 'token',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/token'
        },{
            name: 'continue-with-app-sign',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/continue-with-app-sign'
        },{
            name: 'check-your-device',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/check-your-device'
        },{
            name: 'sms-selection',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sms-selection'
        },{
            name: 'sms-otp',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sms-otp'
        },{
            name: 'eia-selection',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/eia-selection'
        },{
            name: 'eia',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/eia'
        },{
            name: 'sdid',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sdid'
        },{
            name: 'sdid-trusted',
            url: 'http://localhost:3000/bos/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sdid-trusted'
        }]
    },

    // Lloyds (Halifax branding)
    'lloyds.sca.halifax': {
        breakpoints: ['mobile','tablet','desktop'],
        pages: [{
            name: 'user-id',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/user-id'
        },{
            name: 'mi',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/mi'
        },{
            name: 'continue-with-token',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/continue-with-token'
        },{
            name: 'token',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/token'
        },{
            name: 'continue-with-app-sign',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/continue-with-app-sign'
        },{
            name: 'check-your-device',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/check-your-device'
        },{
            name: 'sms-selection',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sms-selection'
        },{
            name: 'sms-otp',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sms-otp'
        },{
            name: 'eia-selection',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/eia-selection'
        },{
            name: 'eia',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/eia'
        },{
            name: 'sdid',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sdid'
        },{
            name: 'sdid-trusted',
            url: 'http://localhost:3000/halifax/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sdid-trusted'
        }]
    },

    // Lloyds (Lloyds branding)
    'lloyds.sca.lloyds': {
        breakpoints: ['mobile','tablet','desktop'],
        pages: [{
            name: 'user-id',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/user-id'
        },{
            name: 'mi',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/mi'
        },{
            name: 'continue-with-token',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/continue-with-token'
        },{
            name: 'token',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/token'
        },{
            name: 'continue-with-app-sign',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/continue-with-app-sign'
        },{
            name: 'check-your-device',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/check-your-device'
        },{
            name: 'sms-selection',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sms-selection'
        },{
            name: 'sms-otp',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sms-otp'
        },{
            name: 'eia-selection',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/eia-selection'
        },{
            name: 'eia',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/eia'
        },{
            name: 'sdid',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sdid'
        },{
            name: 'sdid-trusted',
            url: 'http://localhost:3000/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors/sdid-trusted'
        }]
    }
};

/**
 * Generate the screenshots for a specific journey (including all of its steps)
 * @function screenshots
 */
async function screenshots({ index, pageData: { pageName, pageUrl }, pageObj, projectName }) {
    // Whats going to be the filename of each page?
    const filePrefix = index.toString().padStart(2, '0');

    // MOBILE breakpoint
    fs.mkdirSync(`./output/${projectName}/fullsize/mobile/`, { recursive: true });
    fs.mkdirSync(`./output/${projectName}/thumbnails/mobile`, { recursive: true });

    // Thumbnail image
    await pageObj.emulate(devices['iPhone X']);
    await pageObj.goto(pageUrl);
    await pageObj.setViewport({
        deviceScaleFactor: 2,
        height: 720, 
        width: 311
    });
    await pageObj.screenshot({
        path: `./output/${projectName}/thumbnails/mobile/${filePrefix}-${pageName}.jpg`,
        type: 'jpeg',
    });
    console.log(`Mobile (thumbnail): ${pageUrl}`);

    // Fullsize size
    await pageObj.emulate(devices['iPhone X']);
    await pageObj.goto(pageUrl);
    await pageObj.screenshot({
        fullPage: true,
        path: `./output/${projectName}/fullsize/mobile/${filePrefix}-${pageName}.jpg`,
        type: 'jpeg'
    });
    console.log(`Mobile (fullsize): ${pageUrl}`);

    // TABLET breakpoint
    // *****************
    fs.mkdirSync(`./output/${projectName}/fullsize/tablet/`, { recursive: true });
    fs.mkdirSync(`./output/${projectName}/thumbnails/tablet`, { recursive: true });

    // Thumbnail image
    await pageObj.emulate(devices.iPad);
    await pageObj.goto(pageUrl);
    await pageObj.setViewport({
        deviceScaleFactor: 2,
        height: 1024, 
        width: 768
    });
    await pageObj.screenshot({
        path: `./output/${projectName}/thumbnails/tablet/${filePrefix}-${pageName}.jpg`,
        type: 'jpeg',
    });
    console.log(`Tablet (thumbnail): ${pageUrl}`);

    // Fullsize size
    await pageObj.emulate(devices.iPad);
    await pageObj.goto(pageUrl);
    await pageObj.setViewport({
        deviceScaleFactor: 2,
        height: 1,
        width: 768,
    }); // The full-page setting will override the 1px height here
    await pageObj.screenshot({
        fullPage: true,
        path: `./output/${projectName}/fullsize/tablet/${filePrefix}-${pageName}.jpg`,
        type: 'jpeg'
    });
    console.log(`Tablet (fullsize): ${pageUrl}`);

    // DESKTOP breakpoint
    fs.mkdirSync(`./output/${projectName}/fullsize/desktop`, { recursive: true });
    fs.mkdirSync(`./output/${projectName}/thumbnails/desktop`, { recursive: true });

    // Thumbnail image
    await pageObj.goto(pageUrl);
    await pageObj.setViewport({
        height: 720, 
        width: 960
    });
    await pageObj.screenshot({
        path: `./output/${projectName}/thumbnails/desktop/${filePrefix}-${pageName}.jpg`,
        type: 'jpeg',
    });
    console.log(`Desktop (thumbnail): ${pageUrl}`);

    // Desktop image
    await pageObj.goto(pageUrl);
    await pageObj.setViewport({ width: 960, height: 1 }); // The full-page setting will override the 1px height here
    await pageObj.screenshot({
        fullPage: true,
        path: `./output/${projectName}/fullsize/desktop/${filePrefix}-${pageName}.jpg`,
        type: 'jpeg',
    });
    console.log(`Desktop (fullsize): ${pageUrl}`);
}

// Generate the screenshots for all journey pages
(async function projectPages(projectName, projectData) {
    // Global setup for Puppeteer
    const browserObj = await puppeteer.launch({ headless: true });
    const pageObj = await browserObj.newPage();

    // Remove the screenshot output directory
    rimraf.sync('./output');

    console.log(`**** Generating screenshots for ${projectName} ****`);

    for (let i=0; i<=projectData.pages.length-1; i++) {
        await(screenshots({
            breakpoints: projectData.breakpoints,
            index: i+1,
            pageData: {
                pageName: projectData.pages[i].name,
                pageUrl: projectData.pages[i].url
            },
            pageObj,
            projectName
        }));
    }
})(projectToScreenshot, projectsAndPages[projectToScreenshot]);