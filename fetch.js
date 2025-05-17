const fs = require('fs');
const fetch = require('node-fetch');

const NUM_TIMES = 200;

const FILE_NAME = 'results.json';

const apis = {
  advice: 'https://api.adviceslip.com/advice',
  affirmation: 'https://www.affirmations.dev',
  catfact: 'https://catfact.ninja/fact',
  uselessfact: 'https://uselessfacts.jsph.pl/random.json?language=en',
};

let results = {
  advice: [],
  affirmation: [],
  catfact: [],
  uselessfact: [],
};

// Load existing data if it exists
if (fs.existsSync(FILE_NAME)) {
  try {
    const existing = fs.readFileSync(FILE_NAME, 'utf8');
    results = JSON.parse(existing);
    console.log('🔄 Loaded existing results.json');
  } catch (err) {
    console.error('⚠️ Failed to parse existing results.json. Starting fresh.');
  }
}

async function fetchData(apiName, url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    switch (apiName) {
      case 'advice':
        return data.slip.advice;
      case 'affirmation':
        return data.affirmation;
      case 'catfact':
        return data.fact;
      case 'uselessfact':
        return data.text;
      default:
        return null;
    }
  } catch (err) {
    console.error(`Error fetching ${apiName}:`, err.message);
    return null;
  }
}

async function main() {
  for (let i = 0; i < NUM_TIMES; i++) {
    for (const [name, url] of Object.entries(apis)) {
      const result = await fetchData(name, url);
      console.log(result);
      if (result) results[name].push(result);
      results[name] = [...new Set(results[name])];
    }
  }

  fs.writeFileSync(FILE_NAME, JSON.stringify(results, null, 2));
  console.log('✅ Appended and saved to results.json');
}

main();
