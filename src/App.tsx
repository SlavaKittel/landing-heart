import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import styled from "styled-components";

export default function GsapApp() {
  const gsapContainer = useRef<HTMLDivElement>(null);
  gsap.registerPlugin(ScrollTrigger);

  useGSAP(
    () => {
      // TODO naming and investigation
      // screw effect
      let proxy = { skew: 0 },
        skewSetter = gsap.quickSetter(".skew-element", "skewY", "deg"), // fast
        clamp = gsap.utils.clamp(-20, 20); // don't let the skew go beyond 20 degrees.
      ScrollTrigger.create({
        onUpdate: (self) => {
          let skew = clamp(self.getVelocity() / -100);
          // only do something if the skew is MORE severe. Remember, we're always tweening back to 0,
          // so if the user slows their scrolling quickly,
          // it's more natural to just let the tween handle that smoothly
          // rather than jumping to the smaller skew.
          if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew;
            gsap.to(proxy, {
              skew: 0,
              duration: 0.8,
              ease: "power3",
              overwrite: true,
              onUpdate: () => skewSetter(proxy.skew),
            });
          }
        },
      });
      // gsap.set(".skew-element", {
      //   transformOrigin: "center center",
      //   force3D: true,
      // });

      // TODO optimization with forEach() + naming
      gsap.from(".text1", {
        duration: 1.4,
        opacity: 0,
        y: 500,
        // TODO create repaeter
        onRepeat: () => {
          console.log("repeat");
        },
      });
      gsap.from(".text2", {
        delay: 0.05,
        duration: 1.4,
        opacity: 0,
        y: 400,
      });
      gsap.from(".text3", {
        delay: 0.1,
        duration: 1.4,
        opacity: 0,
        y: 300,
      });
      // gsap.to(".ecg1", {
      //   scrollTrigger: {
      //     trigger: ".ecg1",
      //     start: "top 100%",
      //     end: "bottom 0",
      //     scrub: true,
      //   },
      //   x: -1000,
      // });
      // gsap.to(".ecg2", {
      //   scrollTrigger: {
      //     trigger: ".ecg2",
      //     start: "top 100%",
      //     end: "bottom 0",
      //     scrub: true,
      //   },
      //   x: 1000,
      // });
      // gsap.to(".flower-heart1", {
      //   scrollTrigger: {
      //     trigger: ".flower-heart1",
      //     start: "top 100%",
      //     end: "bottom 0",
      //     scrub: true,
      //     // markers: true,
      //   },
      //   y: -200,
      // });
      // gsap.to(".flower-heart", {
      //   scrollTrigger: {
      //     trigger: ".flower-heart",
      //     start: "top 100%",
      //     end: "bottom 50%",
      //     scrub: true,
      //     // markers: true,
      //   },
      //   y: -1000,
      // });
    },
    { scope: gsapContainer }
  );
  // }, { depenedencies: [blabla], scope: gsapContainer});
  // }, { revertOnUpadate: true }); // animation will be start from the beginning every new render

  const onClickHandler = () => {
    window.open("https://www.linkedin.com/in/slavakittel/");
  };

  return (
    <GsapAppStyled ref={gsapContainer}>
      {/* <div className="loader">
        Loading...<span id="progress-text">0%</span>
        <div id="progress-container">
          <div id="progress-bar"></div>
        </div>
      </div> */}
      <ParticlesHeartAppStyled id="heart-app" />
      <div className="first-text-block">
        <div className="text1">knock knock knock</div>
        <div className="text2">knock knock knock</div>
        <div className="text3">knock knock knock</div>
      </div>
      {/* <div className="ecg1">
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
      </div> */}
      <div className="image-container">
        {/* <img
          src="/img/real-heart1.svg"
          alt="drift-car"
          width="500"
          height="500"
          className="drift-car"
        /> */}
        {/* <img
          src="/img/flower-heart.svg"
          alt="flower-heart1"
          width="500"
          height="500"
          className="flower-heart"
        />
        <img
          src="/img/flower-heart.svg"
          alt="flower-heart"
          width="500"
          height="500"
          className="flower-heart"
        /> */}
      </div>
      {/* <div className="ecg2">
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
        <img src="/img/ecg.svg" alt="ecg" height="100" className="" />
      </div> */}
      <div className="contact-me-block">
        <div className="contact-me" onClick={onClickHandler}>
          contact me
        </div>
      </div>
    </GsapAppStyled>
  );
}

export const ParticlesHeartAppStyled = styled.div`
  width: 100%;
  position: absolute;
  .test {
    z-index: 1;
    position: relative;
    font-size: 50px;
  }
  canvas {
    width: 100% !important;
    height: 100% !important;
    position: fixed;
  }
`;

export const GsapAppStyled = styled.div`
  /* Loading screen styling */
  .loader {
    position: absolute;
    width: 100vw;
    height: 100vh;
    background: rgba(49, 29, 29);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5em;
    z-index: 10;
  }

  /* Progress bar container */
  #progress-container {
    width: 50%;
    background: #333;
    height: 20px;
    border-radius: 10px;
    margin-top: 20px;
    overflow: hidden;
  }

  /* Actual progress bar */
  #progress-bar {
    background: #4caf50;
    width: 0%;
    height: 100%;
  }

  height: 300vh;
  width: 100%;
  font-family: "Bebas Neue", sans-serif;
  font-weight: 400;
  font-style: normal;
  .first-text-block {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    .text1 {
      font-size: 80px;
    }
    .text2 {
      font-size: 80px;
    }
    .text3 {
      font-size: 80px;
    }
  }
  .ecg1 {
    white-space: nowrap;
  }
  .ecg2 {
    white-space: nowrap;
    position: relative;
    right: 1000px;
  }
  .image-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100vh;
    .drift-car {
      position: relative;
      top: 100px;
    }
    .flower-heart {
      position: relative;
      top: 350px;
    }
  }
  .contact-me-block {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    color: #ffe8e8b9;
    .contact-me {
      cursor: pointer;
      font-size: 80px;
    }
  }
`;
