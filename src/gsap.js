import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// HEADER //

// knocks by scroll
gsap.to(".knock-one", {
  scrollTrigger: {
    trigger: ".knock-one",
    start: "top 45%",
    scrub: true,
  },
  x: 30,
  ease: "expoScale(0.1, 7, none)",
});
gsap.to(".knock-two", {
  scrollTrigger: {
    trigger: ".knock-one",
    start: "top 45%",
    scrub: true,
  },
  x: -50,
  ease: "expoScale(0.1, 7, none)",
});
gsap.to(".knock-three", {
  scrollTrigger: {
    trigger: ".knock-one",
    start: "top 45%",
    scrub: true,
  },
  x: 100,
  ease: "expoScale(0.1, 7, none)",
});
// knocks fade in
gsap.to(".knock-one", {
  y: -120,
  duration: 1.5,
  ease: "back.out(2)",
});
gsap.to(".knock-two", {
  y: -120,
  duration: 1.5,
  delay: 0.1,
  ease: "back.out(1.7)",
});
gsap.to(".knock-three", {
  y: -120,
  duration: 1.5,
  delay: 0.2,
  ease: "back.out(1.3)",
});

// PICTURES //

// knocks fade in
gsap.to(".picture-one", {
  scrollTrigger: {
    trigger: ".picture-one",
    scrub: true,
  },
  x: -205,
  y: 0,
  rotate: -30,
  ease: "expoScale(0.1, 7, none)",
});
gsap.to(".picture-two", {
  scrollTrigger: {
    trigger: ".picture-two",
    scrub: true,
  },
  x: 205,
  y: 0,
  rotate: 25,
  ease: "expoScale(0.1, 7, none)",
});

// FOOTER //

gsap.to(".contact-me", {
  scrollTrigger: {
    trigger: ".contact-me",
    start: "top 80%",
    // markers: true,
  },
  y: -120,
  duration: 1.5,
  ease: "back.out(2)",
});
//linkeindin svg
gsap.to(".linkeidin-svg", {
  scrollTrigger: {
    trigger: ".contact-me",
    start: "top 80%",
  },
  x: 100,
  opacity: 1, // only one time for one class
  duration: 1.5,
  ease: "power3.out",
});
gsap.to(".linkeidin-svg", {
  scrollTrigger: {
    trigger: ".contact-me",
    start: "top 80%",
  },
  y: -30,
  duration: 1,
  ease: "power3.out",
});
//github svg
gsap.to(".github-svg", {
  scrollTrigger: {
    trigger: ".contact-me",
    start: "top 80%",
  },
  x: -100,
  opacity: 1, // only one time for one class
  duration: 1.5,
  ease: "power3.out",
});
gsap.to(".github-svg", {
  scrollTrigger: {
    trigger: ".contact-me",
    start: "top 80%",
  },
  y: -30,
  duration: 1,
  ease: "power3.out",
});
