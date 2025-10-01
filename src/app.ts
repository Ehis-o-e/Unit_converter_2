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


app.get("/", (req, res) => {
    res.sendFile("index.html", { root: process.cwd() });
});
app.get("/weight", (req, res) => {
    res.sendFile("weight.html", { root: process.cwd() });
});
app.get("/Temp", (req, res) => {
    res.sendFile("Temp.html", { root: process.cwd() });
});

app.post("/", (req, res) => {
    const {value, convertFrom, convertTo} = req.body;
    const result = conversion(parseFloat(value), convertFrom, convertTo, 'length');
    res.send(`<h1>Converted Value: ${result}</h1><a href="/">Go Back</a>`);
});

app.post("/weight", (req, res) => {
    const {value, convertFrom, convertTo} = req.body;
    const result = conversion(parseFloat(value), convertFrom, convertTo, 'weight');
    res.send(`<h1>Converted Value: ${result}</h1><a href="/weight">Go Back</a>`);
});
app.post("/Temp", (req, res) => {
    const {value, convertFrom, convertTo} = req.body;
    const result = conversion(parseFloat(value), convertFrom, convertTo, 'temperature');
    res.send(`<h1>Converted Value: ${result}</h1><a href="/Temp">Go Back</a>`);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});