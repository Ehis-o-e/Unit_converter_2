import express from 'express';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.')); 

const PORT = 3000;

const conversionFactors: { [key: string]: { [key: string]: number } } = {
    length: {
        meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001,
        mile: 1609.34, yard: 0.9144, foot: 0.3048, inch: 0.0254
    },
    weight: {
        gram: 1, kilogram: 1000, milligram: 0.001,
        pound: 453.592, ounce: 28.3495
    },
    temperature: {
        celsius: 1, fahrenheit: 1, kelvin: 1
    }
}

function convertTemperature(value: number, fromUnit: string, toUnit: string): number {  
    if (fromUnit === toUnit) return value;

    let celsius: number;
    switch (fromUnit) {
        case 'celsius': celsius = value; break;
        case 'fahrenheit': celsius = (value - 32) * 5/9; break;
        case 'kelvin': celsius = value - 273.15; break;
        default: throw new Error(`Invalid from unit: ${fromUnit}`);
    }
    
    switch (toUnit) {
        case 'celsius': return celsius;
        case 'fahrenheit': return (celsius * 9/5) + 32;
        case 'kelvin': return celsius + 273.15;
        default: throw new Error(`Invalid to unit: ${toUnit}`);
    }
}

function conversion(value: number, fromUnit: string, toUnit: string, type: 'length' | 'weight'| 'temperature'): number {
    if (type === 'temperature') {
        return convertTemperature(value, fromUnit, toUnit);
    }

    const fromFactor = conversionFactors[type]![fromUnit];
    const toFactor = conversionFactors[type]![toUnit];   
    return (value * fromFactor!) / toFactor!;
}

function handleConversion(
    req: express.Request, 
    res: express.Response, 
    type: 'length' | 'weight' | 'temperature',
    redirectPath: string
) {
    try {
        const {value, convertFrom, convertTo} = req.body;
        const result = conversion(parseFloat(value), convertFrom, convertTo, type);
        res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Result</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
        }
        h1 { color: #333; font-size: 1.5em; margin-bottom: 20px; }
        .result { font-size: 2em; color: #4a5568; font-weight: bold; margin: 30px 0; }
        a {
            display: inline-block;
            padding: 12px 30px;
            background: #4a5568;
            color: white;
            text-decoration: none;
            border-radius: 6px;
        }
        a:hover { background: #2d3748; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Converted Value</h1>
        <div class="result">${result.toFixed(4)}</div>
        <a href="${redirectPath}">Go Back</a>
    </div>
</body>
</html>
        `);
    } catch (error) {
        res.status(400).send(`<h1>Error: ${error instanceof Error ? error.message : 'Unknown error'}</h1><a href="${redirectPath}">Go Back</a>`);
    }
}

// Routes
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: process.cwd() });
});

app.get("/weight", (req, res) => {
    res.sendFile("weight.html", { root: process.cwd() });
});

app.get("/Temp", (req, res) => {
    res.sendFile("Temp.html", { root: process.cwd() });
});

// Conversion routes
app.post("/", (req, res) => {
    handleConversion(req, res, 'length', '/');
});

app.post("/weight", (req, res) => {
    handleConversion(req, res, 'weight', '/weight');
});

app.post("/Temp", (req, res) => {
    handleConversion(req, res, 'temperature', '/Temp');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});