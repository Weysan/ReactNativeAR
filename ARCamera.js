import React from 'react';
import { AR } from 'expo';
import { GraphicsView } from 'expo-graphics';
import ExpoTHREE, { THREE, AR as ThreeAR } from 'expo-three';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import TouchableView from './TouchableView'

export default class ARCamera extends React.Component {
  componentWillMount() {
    THREE.suppressExpoWarnings(true);
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'blue' }}>
      <TouchableView
        style={{ flex: 1, backgroundColor: 'orange' }}
        shouldCancelWhenOutside={false}
        onTouchesBegan={this.onTouchesBegan}>
        <GraphicsView
          isArEnabled
          arTrackingConfiguration={AR.TrackingConfigurations.World}
          onContextCreate={this.onContextCreate}
          onRender={this.onRender}
          style={{ flex: 1 }}
          isArRunningStateEnabled
          isArCameraStateEnabled
        />
      </TouchableView>
      <TouchableOpacity onPress={this.createNewItem}>
         <Text style={{margin: 30}}>
             button name
         </Text>
      </TouchableOpacity >
      </View>
    );
  }

  onContextCreate = ({
    // Web: const gl = canvas.getContext('webgl')
    gl,
    width,
    height,
    scale,
  }) => {
    AR.setPlaneDetection(AR.PlaneDetection.Horizontal);

    // Renderer
    this.renderer = new ExpoTHREE.Renderer({
      gl,
      width,
      height,
      pixelRatio: scale,
    });

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);

    // Camera
    this.camera = new ThreeAR.Camera(width, height, 0.1, 1000);

    // Cube
    this.createBox();

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(3, 3, 3);
    this.scene.add(light);

    this.points = new ThreeAR.Points();
    // Add the points to our scene...
    this.scene.add(this.points);

  };

  //function to create a box in the current scene
  createBox = () => {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.05);
    var randColor = Math.floor(Math.random()*16777215).toString(16);

    const material = new THREE.MeshPhongMaterial({
      color: eval('0x' + randColor),
    });

    var cube = new THREE.Mesh(geometry, material);
    const xScale = 1;
    cube.scale.set(xScale, xScale, xScale);
    cube.position.z = -0.4; //set a position = 4m in front of the camera
    //cube.position.y = -0.4; //set a position = 4m to bottom
    //cube.position.x = -0.4; //set a position = 4m to left

    var magnetic = new ThreeAR.MagneticObject();
    magnetic.add(cube);
    this.scene.add(magnetic);
    return cube;
  };

  onRender = () => {
    this.renderer.render(this.scene, this.camera);
  };

  // create an item when clicking on the camera
  onTouchesBegan = async ({ locationX: x, locationY: y }) => {
   if (!this.renderer) {
      return;
    }

    // Get the size of the renderer
    var size = new THREE.Vector2();
    const rendererSize = this.renderer.getSize(size);

    // Invoke the native hit test method
    const { hitTest } = await AR.performHitTest(
      {
        x: x / size.width,
        y: y / size.height,
      },
      // Result type from intersecting a horizontal plane estimate, determined for the current frame.
      AR.HitTestResultTypes.HorizontalPlane
    );

    // view https://snack.expo.io/@bacon/ar-hit-test?session_id=snack-session-hFSp0RY1Z
    // Traverse the test results
    for (let hit of hitTest) {
      const { worldTransform } = hit;
      var new_cube = this.createBox();

      // Disable the matrix auto updating system
      new_cube.matrixAutoUpdate = false;

      const matrix = new THREE.Matrix4();
      matrix.fromArray(worldTransform);

      // Manually update the matrix
      new_cube.applyMatrix(matrix);
      new_cube.updateMatrix();
    }
  };

  // create a new Item by clicking in a button automatically in the center of the screen
  createNewItem = () => {
    if (!this.renderer) {
       return;
     }

    var size = new THREE.Vector2();
    const rendererSize = this.renderer.getSize(size);
    var x = rendererSize.width / 2;
    var y = rendererSize.height / 2;
    this.onTouchesBegan({locationX: x, locationY: y})
  };
}
