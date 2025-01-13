import { DataConfig, IncidenceConfig, DetectionConfig, HealthcareConfig } from "./data-config.js";
import { CircleRender } from "./circle-render.js";
import { TreemapRender } from "./treemap-render.js";
import {ForceRender} from "./force-render.js"

const countryConfig = {
    "Bolivia (Plurinational State of)":"Bolivia",
    "Bosnia and Herzegovina":"Bosnia and Herz.",
    "Brunei Darussalam": "Brunei",
    "Central African Republic": "Central African Rep.",
    "C��te d'Ivoire": "Cote d'Ivoire",
    "Democratic People's Republic of Korea": "North Korea",
    "Democratic Republic of the Congo": "Dem. Rep. Congo",
    "Dominican Republic": "Dominican Rep.",
    "Equatorial Guinea": "Eq. Guinea",
    "Iran (Islamic Republic of)": "Iran",
    "Lao People's Democratic Republic": "Laos",
    "Netherlands (Kingdom of the)": "Netherlands",
    "North Macedonia": "Macedonia",
    "occupied Palestinian territory": "Palestine",
    "Republic of Korea": "South Korea",
    "Republic of Moldova": "Moldova",
    "Russian Federation": "Russia",
    "Saint Vincent and the Grenadines": "St. Vin. and Gren.",
    "Solomon Islands": "Solomon Is.",
    "South Sudan": "S. Sudan",
    "Syrian Arab Republic": "Syria",
    "The United Kingdom": "United Kingdom",
    "T��rkiye": "Turkey",
    "Türkiye": "Turkey",
    "United Republic of Tanzania": "Tanzania",
    "Viet Nam": "Vietnam"
}

d3.queue().defer(d3.csv, "../assets/data-tb.csv")
.awaitAll(function(error, results) {
    if (error) throw error
    const csvData = results[0]
    const circleData = results[1]
    const circleConfig = new DataConfig(countryConfig)
    const dataConfig = new DataConfig(countryConfig, circleData)
    const incidenceConfig = new IncidenceConfig(countryConfig, csvData);
    const detectionConfig = new DetectionConfig(countryConfig, csvData);
    const healthcareConfig = new HealthcareConfig(countryConfig, csvData);
    dataConfig.quickSort(csvData, "indicator_name")
    incidenceConfig.incidenceParse(csvData)
    detectionConfig.detectionParse(csvData)
    healthcareConfig.healthcareParse(csvData)

    const femInfect = incidenceConfig.femInfect
    // console.log(femInfect)
    const femDetect = detectionConfig.femDetect
    // console.log(femDetect)
    const femHealth = healthcareConfig.femHealth
    // console.log(femHealth)


    const econData = circleConfig.formatCircle(femInfect)
    // console.log(econData)
    const healthData = dataConfig.formatTreemap(femHealth, femDetect)
    // console.log(healthData)
    const detectData = dataConfig.formatForce(femDetect)
    // console.log(detectData)

    const circleRender = new CircleRender(econData, "#circle-container")
    const treemapRender = new TreemapRender(healthData, "#treemap-container", "https://restcountries.com/v3.1")
    const forceRender = new ForceRender(detectData, "#force-container")
})

