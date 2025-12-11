import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function testAudio() {
    console.log("Testing /api/narrate endpoint...");
    try {
        const response = await fetch('http://localhost:3001/api/narrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: "Hello, this is a test of the Mumbai Kahaani audio system.",
                voiceId: "21m00Tcm4TlvDq8ikWAM"
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Server returned ${response.status}: ${error}`);
        }

        const buffer = await response.arrayBuffer();
        console.log(`Success! Received audio buffer of size: ${buffer.byteLength} bytes`);

        // Save to file to verify
        // fs.writeFileSync('test-audio.mp3', Buffer.from(buffer));
        // console.log("Saved to test-audio.mp3");

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testAudio();
