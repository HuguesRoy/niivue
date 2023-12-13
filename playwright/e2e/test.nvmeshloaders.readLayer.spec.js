import { test, expect } from '@playwright/test'
import { httpServerAddress } from './helpers'

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto(httpServerAddress)
  console.log(`Running ${testInfo.title}`)
})

test('nvmeshloaders readLayer', async ({ page }) => {
  const nlayers = await page.evaluate(async () => {    
    // load one volume object in an array
    const nv = new Niivue({
      show3Dcrosshair: true,
      backColor: [1, 1, 1, 1],
      meshXRay: 0.3
    });
    nv.attachTo("gl");
    nv.opts.isColorbar = true;
  
    await nv.loadMeshes([
      {
        url: "./images/BrainMesh_ICBM152.lh.mz3",
        rgba255: [255, 255, 255, 255],
      },
      { url: "./images/CIT168.mz3", rgba255: [0, 0, 255, 255] },
    ]);
    const layer =
    {
      url: "./images/BrainMesh_ICBM152.lh.motor.mz3",
      cal_min: 0.5,
      cal_max: 5.5,
      useNegativeCmap: true,
      opacity: 0.7,
    };
    const response = await fetch(layer.url)
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const buffer = await response.arrayBuffer();
    niivue.NVMeshLoaders.readLayer(layer.url, buffer, nv.meshes[0], layer.opacity, 'gray', undefined, layer.useNegativeCmap);
    nv.meshes[0].updateMesh(nv.gl);
    nv.drawScene();
    return nv.meshes[0].layers.length;
  })
  expect(nlayers).toBe(1)
  await expect(page).toHaveScreenshot({ timeout: 30000 })
})
