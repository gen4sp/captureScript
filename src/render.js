import fs from 'fs'
import path from 'path'
import timecut from 'timecut'
import timesnap from 'timesnap'

const WEBAPP_URL = 'http://localhost:3000' // url to web app to render
const OUTPUT_DIR = path.join(__dirname, '..', 'output')
const TEMP_DIR = path.join(__dirname, '..', 'temp')
console.log(TEMP_DIR)
async function shouldSkipFrame({ page }) {
    const res = await page.evaluate(
        'window._puppeteerShouldSkipFrameFlag === true'
    )
    console.log('r', res)
    return res
}
export async function renderVideo(
    outputFilename,
    jsonString // stringified json with webapp settings, could be an json url, but it it makes loading time longer which could be crucial
) {
    try {
        const output = path.join(OUTPUT_DIR, outputFilename)
        await timecut({
            url: `${WEBAPP_URL}?jsonString=${jsonString}`,
            viewport: {
                width: 512,
                height: 512,
            },
            ignoreHTTPSErrors: true,
            headless: true,
            devtools: false,
            shouldSkipFrame,
            stopFunctionName: '_puppeteerStopCapture',
            pipeMode: true,
            quiet: false, // make it true to hide debug output
            start: 0,
            fps: 5,
            duration: 60, // maximum duration. to be able capture longer - increace (secs)
            launchArguments: ['--no-sandbox', '--timeout 0'],
            output, // to video.mp4 of the current working directory
        }).then(function () {
            console.log('Render mpg Done!')
        })
        return fs.createReadStream(`${output}`)
    } catch (e) {
        console.error(e)
        return null
    }
}

// to render a thumb/preview image
export async function renderImage(
    outputFilename, // path and filename to save the video
    jsonString // stringified json with webapp settings, could be an json url, but it it makes loading time longer which could be crucial
) {
    await timesnap({
        url: `${WEBAPP_URL}?jsonString=${jsonString}`,
        viewport: {
            width: 512, // sets the viewport (window size) to 800x600
            height: 512,
        },
        // preparePage: initPage,
        // stopFunctionName: 'stopCapture',
        frames: 1,
        startDelay: 1,
        start: 2,
        screenshotType: 'jpeg',
        outputDirectory: TEMP_DIR,
        // launchArguments: ['--no-sandbox'],
        launchArguments: ['--no-sandbox', '--timeout 300000'],
        outputPattern: outputFilename,
    }).then(function () {
        console.log('Done jpg render!')
    })

    return fs.createReadStream(`${OUTPUT_DIR}/${outputFilename}`)
}

export default {
    renderVideo,
    renderImage,
}
