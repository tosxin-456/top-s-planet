import React, { useRef, useEffect } from 'react';
import { Text } from 'troika-three-text'; // Import Text from 'troika-three-text'
import * as THREE from 'three';

function Navbar({ scene }) {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.sync(); // Ensure text updates properly
    }
  }, []);

  // Position the text at the top of the scene
  const textPosition = new THREE.Vector3(0, 25, 0); // Adjust as needed

  return (
    <group position={textPosition}>
      <Text
        ref={textRef}
        text="Topinn's World" // Adjust text content as needed
        fontSize={10} // Adjust font size as needed
        color="white" // Adjust text color as needed
        maxWidth={210} // Adjust maximum width as needed
        anchorX="center"
        anchorY="top" // Position text at the top
      />
    </group>
  );
}




export default Navbar;
