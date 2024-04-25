import ExcelJS from "exceljs";

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function getRandomRows(array, numRows, randomIndices = null) {
    if (!randomIndices) {
        // 创建包含所有行索引的数组
        const indices = Array.from({ length: array.length }, (_, i) => i);
        // 随机排列索引数组
        shuffle(indices);
        // 取出前numRows个索引
        const randomIndices = indices.slice(0, numRows);
        // 从原数组中选取相应的行
        const randomRows = randomIndices.map(index => array[index]);
        return { randomRows, randomIndices };
    } else {
        const randomRows = randomIndices.slice(0, numRows).map(index => array[index]);
        return randomRows;
    }
}

function removeRandomRows(arr1, arr2) {
    // 创建一个 Set 来快速查找需要移除的行的引用
    const rowsToRemove = new Set(arr2.map(row => JSON.stringify(row)));
    var rows = [];
    // 过滤
    const filteredArray = arr1.filter((row, index) => {
        if (rowsToRemove.has(JSON.stringify(row))) {
            rows.push(index);
        }
        return !rowsToRemove.has(JSON.stringify(row));
    });
    // console.log(rows);
    return filteredArray;
}

export const runModel = async (e) => {
    // tf.tensor([1, 2, 3, 4]).print();

    const data = e.target.files[0].arrayBuffer();

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(data);

    const worksheet = wb.getWorksheet(1);
    const name = worksheet.getSheetValues()[1];
    let train_input = [];
    let train_output = [];
    let test_input = [];
    let test_output = [];
    let randomIndices = [];
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        train_input.push(row.values.slice(1, -1));
        train_output.push(row.values.pop());

        // row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        //     console.log(name[colNumber] + ' = ' + cell.value);
        // });
    });

    train_input.shift();
    train_output.shift();
    ({ randomRows: test_input, randomIndices } = getRandomRows(train_input, 30));
    test_output = getRandomRows(train_output, 30, randomIndices);

    train_input = removeRandomRows(train_input, test_input);
    train_output = removeRandomRows(train_output, test_output);

    // test_input = train_input.slice(0, 30);
    // test_output = train_output.slice(0, 30);
    // train_input = train_input.slice(31, train_input.length);
    // train_output = train_output.slice(31, train_output.length);

    train_input = tf.tensor2d(train_input);
    test_input = tf.tensor2d(test_input);
    train_output = tf.tensor2d(train_output, [train_output.length, 1]);
    test_output = tf.tensor2d(test_output, [test_output.length, 1]);

    // const train_input_max = Math.max(...train_input.map(row => Math.max(...row)));
    // const train_input_min = Math.min(...train_input.map(row => Math.min(...row)));
    // const train_output_max = Math.max(...train_output);
    // const train_output_min = Math.min(...train_output);
    // const test_input_max = Math.max(...test_input.map(row => Math.max(...row)));
    // const test_input_min = Math.min(...test_input.map(row => Math.min(...row)));
    // const test_output_max = Math.max(...test_output);
    // const test_output_min = Math.min(...test_output);
    const train_input_max = train_input.max(0);
    const train_input_min = train_input.min(0);
    const test_input_max = test_input.max(0);
    const test_input_min = test_input.min(0);
    // const train_output_max = tf.tensor1d(train_output).max();
    // const train_output_min = tf.tensor1d(train_output).min();
    const train_output_max = train_output.max();
    const train_output_min = train_output.min();
    const test_output_max = test_output.max();
    const test_output_min = test_output.min();

    // 归一化
    const train_input_normalized = (train_input.sub(train_input_min)).div(train_input_max.sub(train_input_min)).mul(2).sub(1).expandDims(2);
    const test_input_normalized = (test_input.sub(test_input_min)).div(test_input_max.sub(test_input_min)).mul(2).sub(1).expandDims(2);
    // const train_output_normalized = tf.tensor2d(train_output).sub(train_output_min).div(train_output_max.sub(train_output_min));
    const train_output_normalized = (train_output.sub(train_output_min)).div(train_output_max.sub(train_output_min)).mul(2).sub(1);
    const test_output_normalized = (test_output.sub(test_output_min)).div(test_output_max.sub(test_output_min)).squeeze();
    train_input_normalized.print()

    // const train_input_normalized = train_input.map(row => row.map(col => (col - train_input_min) / (train_input_max - train_input_min)));
    // const test_input_normalized = test_input.map(row => row.map(col => (col - test_input_min) / (test_input_max - test_input_min)));
    // const train_output_normalized = train_output.map(val => (val - train_output_min) / (train_output_max - train_output_min));
    // const test_output_normalized = train_output.map(val => (val - test_output_min) / (test_output_max - test_output_min));
    // console.log(train_input_normalized.shape);
    // console.log(test_input_normalized.shape);
    // console.log(train_output_normalized.shape);

    // 构建神经网络
    const model = tf.sequential();
    // model.add(tf.layers.dense({ inputShape: [8], activation: 'tanh', units: 6 }));
    // model.add(tf.layers.dense({ activation: 'linear', units: 1 }));
    model.add(tf.layers.simpleRNN({
        units: 3,
        activation: 'tanh',
        inputShape: [8, 1], // 输入形状为 [timeSteps, numFeatures]
    }));
    // model.add(tf.layers.timeDistributed(
    //     { layer: tf.layers.dense({ units: 1 }) }));
    model.add(tf.layers.dense({ activation: 'linear', units: 1,  })); // 输出层

    // model.add(tf.layers.activation({ activation: 'softmax' }));
    model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
        metrics: ['mse']
    });
    model.fit(train_input_normalized, train_output_normalized, {
        epochs: 1000,
        batchSize: train_output_normalized.length,
        validationSplite: 0.2,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                // console.log(epoch + ':' + logs.loss);
            }
        }
    });
    model.summary();

    saveModelToRemote(model);

    // 测试模型
    const test_output_normalized1 = model.predict(test_input_normalized).squeeze();
    let test_output_denormalized = (test_output_normalized1.add(1)).div(2).mul(test_output_max.sub(test_output_min)).add(test_output_min).squeeze();
    // test_output_denormalized = tf.tensor2d(test_output_denormalized, [test_output_denormalized.length, 1]);

    test_output.squeeze().print();
    test_output_denormalized.print();
    // 性能评估
    // const mse = tf.metrics.meanSquaredError(test_output_normalized1, tf.tensor2d(test_output_normalized, [test_output_normalized.length, 1]));
    const mse = tf.metrics.meanSquaredError(test_output.squeeze(), test_output_denormalized);
    // const mse = tf.metrics.meanSquaredError(test_output_normalized, test_output_normalized1);
    mse.print();
    // console.log("MSE:" + mse);
    const mae = tf.metrics.meanAbsoluteError(test_output.squeeze(), test_output_denormalized);
    // const mae = tf.metrics.meanAbsoluteError(test_output_normalized, test_output_normalized1);
    mae.print();
    // console.log("MAE:" + mae);
    const rmse = tf.sqrt(mse);
    rmse.print();
    // console.log("RMSE:" + rmse);
    const eva = tf.tidy(() => {
    })
    // const eva = tf.tidy(() => {
    //     const diff = test_output_normalized1.sub(test_output_normalized);
    //     const varianceDiff = tf.squaredDifference(diff, diff.mean());
    //     return tf.sub(1.0, tf.div(varianceDiff, tf.squaredDifference(test_output_normalized1, test_output_normalized1.mean())).mean());
    // })
    // eva.print();
    const R2 = tf.tidy(() => {
        // const sumOfSquaresDiff = tf.sum(test_output.squeeze().sub(test_output_denormalized).square());
        // const totalSumOfSquares = tf.sum(test_output.squeeze().sub(test_output.squeeze().mean()).square());

        const yTrueMean = test_output.squeeze().mean();
        const totalSumOfSquares = tf.sum(tf.squaredDifference(test_output.squeeze(), yTrueMean));
        const residualSumOfSquares = tf.sum(tf.squaredDifference(test_output.squeeze(), test_output_denormalized));
        return tf.sub(1, tf.div(residualSumOfSquares, totalSumOfSquares));
    })
    // const R2 = tf.tidy(() => {
    //     const sumOfSquaresDiff = tf.sum(test_output_normalized.sub(test_output_normalized1).square());
    //     const totalSumOfSquares = tf.sum(test_output_normalized.sub(test_output_normalized.mean()).square());
    //     return tf.sub(1.0, tf.div(sumOfSquaresDiff, totalSumOfSquares));
    // })
    R2.print();
}

async function saveModelToRemote(model) {
    const saveResult = await model.save('服务器');
    console.log(saveResult);
}

export async function loadModelFromRemote() {
    const loadedModel = await tf.loadLayersModel('');
    return loadedModel;
}