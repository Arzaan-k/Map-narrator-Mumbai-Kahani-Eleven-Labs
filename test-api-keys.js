// Comprehensive API Key Tester
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { existsSync } from 'fs';

// Load environment variables
if (existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
} else if (existsSync('.env')) {
    dotenv.config({ path: '.env' });
} else {
    dotenv.config();
}

console.log('🔑 API Key Tester\n');
console.log('═'.repeat(60));

// Test 1: Perplexity API
async function testPerplexity() {
    console.log('\n1️⃣ Testing PERPLEXITY API');
    console.log('─'.repeat(60));
    
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
        console.log('❌ PERPLEXITY_API_KEY not found in .env file');
        return false;
    }
    
    console.log(`✓ Key found: ${apiKey.substring(0, 15)}...`);
    
    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [{ role: 'user', content: 'Say "API test successful" in one word.' }],
                max_tokens: 10,
            }),
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ PERPLEXITY API: VALID & WORKING');
            console.log(`   Response: ${data.choices?.[0]?.message?.content || 'OK'}`);
            return true;
        } else {
            const error = await response.text();
            console.log(`❌ PERPLEXITY API: INVALID (${response.status})`);
            console.log(`   Error: ${error.substring(0, 100)}`);
            return false;
        }
    } catch (error) {
        console.log('❌ PERPLEXITY API: ERROR');
        console.log(`   ${error.message}`);
        return false;
    }
}

// Test 2: Anthropic API
async function testAnthropic() {
    console.log('\n2️⃣ Testing ANTHROPIC (Claude) API');
    console.log('─'.repeat(60));
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
        console.log('❌ ANTHROPIC_API_KEY not found in .env file');
        return false;
    }
    
    console.log(`✓ Key found: ${apiKey.substring(0, 20)}...`);
    console.log(`✓ Key length: ${apiKey.length} characters`);
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 50,
                messages: [{ 
                    role: 'user', 
                    content: 'Reply with only: API test successful' 
                }],
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ ANTHROPIC API: VALID & WORKING');
            console.log(`   Response: ${data.content?.[0]?.text || 'OK'}`);
            return true;
        } else {
            console.log(`❌ ANTHROPIC API: INVALID (${response.status})`);
            console.log(`   Error type: ${data.error?.type || 'unknown'}`);
            console.log(`   Error message: ${data.error?.message || JSON.stringify(data)}`);
            
            if (data.error?.type === 'authentication_error') {
                console.log('\n   💡 Fix: Get a new API key from https://console.anthropic.com/');
            }
            return false;
        }
    } catch (error) {
        console.log('❌ ANTHROPIC API: ERROR');
        console.log(`   ${error.message}`);
        return false;
    }
}

// Test 3: ElevenLabs API
async function testElevenLabs() {
    console.log('\n3️⃣ Testing ELEVENLABS API');
    console.log('─'.repeat(60));
    
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
        console.log('❌ ELEVENLABS_API_KEY not found in .env file');
        return false;
    }
    
    console.log(`✓ Key found: ${apiKey.substring(0, 15)}...`);
    
    try {
        // Test with user info endpoint (doesn't consume credits)
        const response = await fetch('https://api.elevenlabs.io/v1/user', {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey,
            },
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ ELEVENLABS API: VALID & WORKING');
            console.log(`   User: ${data.email || data.first_name || 'Verified'}`);
            console.log(`   Character count: ${data.character_count || 0} / ${data.character_limit || 'unlimited'}`);
            return true;
        } else {
            const error = await response.text();
            console.log(`❌ ELEVENLABS API: INVALID (${response.status})`);
            console.log(`   Error: ${error.substring(0, 100)}`);
            
            if (response.status === 401) {
                console.log('\n   💡 Fix: Get a new API key from https://elevenlabs.io/app/settings/api-keys');
            }
            return false;
        }
    } catch (error) {
        console.log('❌ ELEVENLABS API: ERROR');
        console.log(`   ${error.message}`);
        return false;
    }
}

// Test 4: ElevenLabs Agent ID
function testElevenLabsAgentId() {
    console.log('\n4️⃣ Testing ELEVENLABS AGENT ID');
    console.log('─'.repeat(60));
    
    const agentId = process.env.VITE_ELEVENLABS_AGENT_ID;
    
    if (!agentId) {
        console.log('⚠️ VITE_ELEVENLABS_AGENT_ID not found in .env file');
        console.log('   This is optional but needed for conversational AI features');
        return false;
    }
    
    console.log(`✓ Agent ID found: ${agentId}`);
    
    if (agentId.startsWith('agent_')) {
        console.log('✅ AGENT ID: FORMAT LOOKS VALID');
        console.log('   (Cannot verify without making a session call)');
        return true;
    } else {
        console.log('⚠️ AGENT ID: UNEXPECTED FORMAT');
        console.log('   Expected to start with "agent_"');
        return false;
    }
}

// Run all tests
async function runAllTests() {
    const results = {
        perplexity: false,
        anthropic: false,
        elevenlabs: false,
        agentId: false,
    };
    
    results.perplexity = await testPerplexity();
    results.anthropic = await testAnthropic();
    results.elevenlabs = await testElevenLabs();
    results.agentId = testElevenLabsAgentId();
    
    // Summary
    console.log('\n═'.repeat(60));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(60));
    
    const allPassed = Object.values(results).every(r => r);
    
    console.log(`\nPerplexity API:      ${results.perplexity ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Anthropic API:       ${results.anthropic ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`ElevenLabs API:      ${results.elevenlabs ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`ElevenLabs Agent ID: ${results.agentId ? '✅ VALID' : '⚠️ MISSING/INVALID'}`);
    
    console.log('\n' + '═'.repeat(60));
    
    if (allPassed) {
        console.log('🎉 ALL API KEYS ARE VALID! Your app should work perfectly.');
    } else {
        console.log('⚠️ Some API keys need attention. See details above.');
        console.log('\n📝 Next Steps:');
        
        if (!results.perplexity) {
            console.log('   • Get Perplexity key: https://www.perplexity.ai/settings/api');
        }
        if (!results.anthropic) {
            console.log('   • Get Anthropic key: https://console.anthropic.com/settings/keys');
        }
        if (!results.elevenlabs) {
            console.log('   • Get ElevenLabs key: https://elevenlabs.io/app/settings/api-keys');
        }
        if (!results.agentId) {
            console.log('   • Get Agent ID: https://elevenlabs.io/app/conversational-ai');
        }
        
        console.log('\n   After updating .env, restart the server: npm start');
    }
    
    console.log('');
}

// Run the tests
runAllTests().catch(console.error);

