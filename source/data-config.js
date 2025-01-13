export class DataConfig {
    constructor(countryConfig){
        this.countryConfig = countryConfig
        this.incidence = []
        this.femInfect = []
        this.detection = []
        this.femDetect = []
        this.healthcare = []
        this.femHealth = []
        
    }

    quickSort(arr, key) {
        
        if (arr.length <= 1) {
            return arr;
        }
        let pivot = arr[Math.floor(arr.length / 2)];
        let left = arr.filter(x => x[key] < pivot[key]);
        let right = arr.filter(x => x[key] > pivot[key]);
        let equal = arr.filter(x => x[key] === pivot[key])

        return this.quickSort(left, key).concat(equal, this.quickSort(right, key));
        }
    
    bubbleSort(arr, key) {
        let n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
            if (arr[j][key] > arr[j + 1][key]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
            }
        }
        return arr;
        }

    binarySearch(arr, key, value, findFirst) {
        let low = 0, high = arr.length - 1, result = -1;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            if (arr[mid][key] === value) {
                result = mid;
                if (findFirst) {
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            } else if (arr[mid][key] < value) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return result;
    }

    linearSearch(arr, key, value, findFirst) {
        let result = -1;
    
        for (let i = 0; i < arr.length; i++) {
            if (arr[i][key] === value) {
                result = i; // Update the result with the current index
                if (findFirst && result !== -1) {
                    return result; // Return early if looking for the first occurrence
                }
            }
        }
    
        return result; // Return the last occurrence if findFirst is false
    }

    formatCircle(data) {
        return data.map(item => {
            const countryName = this.countryConfig[item.setting] || item.setting; // Map to the countryConfig or fallback
        return {
            name: countryName,
            children: [
              {
                name: 'Value (10 mil.)', // Name for the first child
                value: parseInt(item.estimate*0.03*(item.population/100000))
              },
              {
                name: 'Radiologists', // Name for the second child
                value: parseInt(item.estimate*(item.population/100000)/35) // The population value
              },
              {
                name: 'Exposure (1,000 x-rays)',
                value: parseInt(item.estimate*0.035*(item.population/100000))
              }
            ]
          };
        });
      }

    // async formatTreemap(data, additionalData, countryConfig) {
    //     const addData = additionalData.reduce((acc, item) => {
    //         acc[item.setting] = item.estimate; // Use 'setting' as the key
    //         return acc;
    //     }, {});
    
    //     const groups = data.reduce((acc, item) => {
    //         const key = item.wbincome2024;
    //         if (!acc[key]) {
    //             acc[key] = [];
    //         }
    //         acc[key].push(item);
    //         return acc;
    //     }, {});
    
    //     // Helper function to fetch definitions from Datamuse
    //     async function fetchDefinition(term) {
    //         const response = await fetch(`https://api.datamuse.com/words?sp=${term}&md=d`);
    //         if (response.ok) {
    //             const words = await response.json();
    //             const definition = words[0]?.defs?.[0]?.split("\t")[1]; // Get the first definition
    //             return definition || "No definition available"; // Fallback if no definition is found
    //         }
    //         return "Error fetching definition"; // Fallback for API errors
    //     }
    
    //     // Transform data into hierarchical structure, replace NaN with 0
    //     const result = {
    //         name: "root",
    //         children: await Promise.all(
    //             Object.entries(groups).map(async ([key, values]) => ({
    //                 name: key,
    //                 children: await Promise.all(
    //                     values.map(async d => {
    //                         const countryName = countryConfig[d.setting] || d.setting; // Map using countryConfig
    //                         const definition = await fetchDefinition(countryName); // Fetch definition for country name
    //                         return {
    //                             name: countryName, // Use mapped name if available
    //                             value: isNaN(d.estimate) ? 0 : parseInt(d.estimate), // Replace NaN with 0
    //                             description: parseInt(addData[d.setting]),
    //                             income: key,
    //                             definition, // Include the fetched definition
    //                         };
    //                     })
    //                 ),
    //             }))
    //         ),
    //     };
    
    //     return result;
    // }
    
      formatTreemap(data, additionalData) {
        const addData = additionalData.reduce((acc, item) => {
            acc[item.setting] = item.estimate; // Use 'setting' as the key
            return acc;
        }, {});

        const groups = data.reduce((acc, item) => {
            const key = item.wbincome2024;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});
    
        // Transform data into hierarchical structure, replace NaN with 0
        return {
            name: "root",
            children: Object.entries(groups).map(([key, values]) => ({
                name: key,
                children: values.map(d => {
                    const countryName = this.countryConfig[d.setting] || d.setting; // Map using countryConfig
                    return {
                        name: countryName, // Use mapped name if available
                        value: isNaN(d.estimate) ? 0 : parseInt(d.estimate), // Replace NaN with 0
                        description: parseInt(addData[d.setting]),
                        income: key
                }
            })
        }))
        };
    }
    
    formatForce(data) {
        const formattedData = [];
        
        // Group data by 'whoreg6'
        const groupedData = data.reduce((acc, item) => {
            const region = item.whoreg6;
        
            // Initialize a new region node if not already present
            if (!acc[region]) {
                acc[region] = { id: region, name: region, children: [] };
            }
        
            // Create a node for each 'setting' under the region
            const settingNode = {
                id: item.setting,
                name: item.setting,
                children: [
                    { id: `population-${item.setting}`, name: `Population: ${item.population}`, value: item.population },
                    { id: `undetected-${item.setting}`, name: `Undetected: ${parseInt(100-item.estimate)}%`, value: item.estimate }
                ]
            };
        
            // Add the 'setting' node to the corresponding 'whoreg6' node
            acc[region].children.push(settingNode);
        
            return acc;
        }, {});
        
        // Convert grouped data into an array format for use in the force-directed layout
        for (const region in groupedData) {
            formattedData.push(groupedData[region]);
        }
        
        // Wrap the formatted data in a root node
        return {
            id: "World",
            name: "World",
            children: formattedData
        };
    }
}

export class IncidenceConfig extends DataConfig {

    constructor(countryConfig, data){
        super(countryConfig, data)
        this.incidence = []
        this.femInfect = []
    }

    incidenceParse(csvData){
        const firstInfect = this.binarySearch(csvData, "indicator_name", "TB incidence (new infections per 100 000 population)", true)
        console.time('Binary Search Time')
        const lastInfect = this.binarySearch(csvData, "indicator_name", "TB incidence (new infections per 100 000 population)", false)
        console.timeEnd('Binary Search Time')
        console.time('QuickSort Time')
        this.incidence = this.quickSort(csvData.slice(firstInfect, lastInfect+1), "subgroup")
        console.timeEnd('QuickSort Time')

        const firstFemInfect = this.binarySearch(this.incidence, "subgroup", "Female", true)
        const lastFemInfect = this.binarySearch(this.incidence, "subgroup", "Female", false)
        this.femInfect = this.incidence.slice(firstFemInfect, lastFemInfect+1)
    }
}

export class DetectionConfig extends DataConfig {
    constructor(countryConfig, data){
        super(countryConfig, data)
        this.detection = []
        this.femDetect = []
    }
    detectionParse(csvData){
        const firstDetection = this.binarySearch(csvData, "indicator_name", "Case detection rate (%)", true)
        const lastDetection = this.binarySearch(csvData, "indicator_name", "Case detection rate (%)", false)
        console.time('Bubble Sort Time')
        this.detection = this.bubbleSort(csvData.slice(firstDetection, lastDetection+1), "subgroup")
        console.timeEnd('Bubble Sort Time')

        const firstFemDetect = this.binarySearch(this.detection, "subgroup", "Female", true)
        const lastFemDetect = this.binarySearch(this.detection, "subgroup", "Female", false)
        this.femDetect = this.detection.slice(firstFemDetect, lastFemDetect)
    }
}

export class HealthcareConfig extends DataConfig{
    constructor(countryConfig, data){
        super(countryConfig, data)
        this.healthcare = []
        this.femHealth = []
    }

    healthcareParse(csvData){
        const firstHealthcare = this.linearSearch(csvData, "indicator_name", "BCG immunization coverage among one-year-olds (%)", true)
        console.time('Linear Search Time')
        const lastHealthcare = this.linearSearch(csvData, "indicator_name", "BCG immunization coverage among one-year-olds (%)", false)
        console.timeEnd('Linear Search Time')
        this.healthcare = this.quickSort(csvData.slice(firstHealthcare, lastHealthcare+1), "subgroup")

        const firstFemHealth = this.binarySearch(this.healthcare,"subgroup", "Female", true)
        const lastFemHealth = this.binarySearch(this.healthcare,"subgroup", "Female", false)
        const slicedArr = this.healthcare.slice(firstFemHealth, lastFemHealth)

        const duplicates = new Set();
        this.femHealth = slicedArr.slice()
        .reverse() // Reverse the order of the sliced array
        .filter((item) => {
            if (!duplicates.has(item.setting)) {
                duplicates.add(item.setting); // Mark this setting as seen
                return true; // Include the last occurrence of this setting
            }
        return false; // Skip duplicates
        })
        .reverse(); // Reverse again to restore original order
    }
    }
    
