import { nextTick, shallowRef } from "vue";

export let WaterTEMPEchart = shallowRef([]);
export let WaterDOEchart = shallowRef (null);
export let WaterNITEchart = shallowRef (null);
export let PhValueEchart = shallowRef (null);
export let WaterTANEchart = shallowRef (null);
export let WaterH2SEchart = shallowRef (null);

export const resizeEcharts = () => {
    // console.log(horizontalEchart.value)
    window.addEventListener('resize', function () {
        nextTick(() => {
            if (WaterTEMPEchart.value) {
                for (let i = 0; i < WaterTEMPEchart.value.length; i++) {
                    WaterTEMPEchart.value[i].resize();
                }
            }
            if (WaterDOEchart.value) {
                WaterDOEchart.value.resize();
            }
            if (WaterNITEchart.value) {
                WaterNITEchart.value.resize();
            }
            if (PhValueEchart.value) {
                PhValueEchart.value.resize();
            }
            if (WaterTANEchart.value) {
                WaterTANEchart.value.resize();
            }
            if (WaterH2SEchart.value) {
                WaterH2SEchart.value.resize();
            }
        })
    });
};

export const destroyEcharts = () => {
    window.removeEventListener('resize', resizeEcharts);
};