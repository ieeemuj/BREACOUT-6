"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Alert, Button, Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa6";
import { get, post } from "./service";
import Image from "next/image";

const Home = () => {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const router = useRouter();

  const imageRefs = useRef([]);
  const containerRef = useRef(null);

  const images = [
    "https://images.prismic.io/ieeemuj/ZvUbArVsGrYSwBTC_gryffindor.png?auto=format,compress",
    "https://images.prismic.io/ieeemuj/ZvUbD7VsGrYSwBTD_hufflepuff.png?auto=format,compress",
    "https://images.prismic.io/ieeemuj/ZvUa5bVsGrYSwBS-_slytherin.png?auto=format,compress",
    "https://images.prismic.io/ieeemuj/ZvUbIbVsGrYSwBTG_ravenclaw.png?auto=format,compress",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.credential) {
      return setErrorMessage("Please fill all the details.");
    }
  
    try {
      setLoading(true);
      setErrorMessage(null);
  
      const data = await post("team/login", {
        credential: formData.credential
      });
  
      console.log(data);
  
      // Check if login was unsuccessful and show an alert
      if (!data.success) {
        setLoading(false);
        return alert("Wrong credentials, please try again.");
      }
  
     
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("team", JSON.stringify(data.data.team));
      localStorage.setItem("clue", JSON.stringify(data.data.clue));
  
      setLoading(false);
  
      // Randomly select and expand an image
      const selectedImageIndex = Math.floor(Math.random() * images.length);
      expandImage(selectedImageIndex);
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };
  

  const expandImage = (index) => {
    setExpandedImage(index);
    router.push('/team');
    // gsap.to(imageRefs.current[index], {
    //   duration: 1,
    //   width: '100vw',
    //   height: '100vh',
    //   position: 'fixed',
    //   top: 0,
    //   left: 0,
    //   zIndex: 50,
    //   ease: 'power2.inOut',
    //   onComplete: () => {
    //     // Navigate to next page after animation
    //     router.push("/gryffindor");
    //   }
    // });

    // gsap.to(containerRef.current, {
    //   duration: 1,
    //   opacity: 0,
    //   ease: 'power2.inOut'
    // });
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="h-screen w-full relative" ref={containerRef}>
      <div className="h-screen grid grid-cols-4">
        {images.map((src, index) => (
          <div key={index} className="h-full object-contain">
            <Image
              ref={el => imageRefs.current[index] = el}
              className="h-full w-screen"
              src={src}
              alt={`Image ${index + 1}`}
              width={200}
              height={500}
              quality={60}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col justify-center items-center ">
        <div>
          <h1 className="font-bold text-center">
            <span className="text-2xl">WELCOME TO</span>
            <br/>
            <br />
            <span className="text-4xl font-astrolab">BREACOUT</span>
          </h1>
        </div>
        <div>
          <form
            className="flex flex-col gap-4 text-center px-24 py-12"
            onSubmit={handleSubmit}
          >
            <div className="w-22">
              <input
                type="text"
                placeholder="Credentials"
                className="w-full p-4 rounded-lg h-10 text-black bg-[#ffffff] bg-opacity-50 outline-0 placeholder-gray-700"
                id="credential"
                onChange={handleChange}
                autoComplete={"off"}
              />
            </div>
            <div className="w-22">

            </div>
            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="">
                  <Spinner size="sm" />
                  <span>Loading</span>
                </div>
              ) : (
                <span className="font-bold text-xl border-2 px-6 py-2 rounded-2xl backdrop-blur-lg bg-white/30 border-white">
                  <FaArrowRight />
                </span>
              )}
            </Button>
          </form>
          {errorMessage && (
            <Alert
              className="mt-5 flex justify-center text-red-600 items-center w-full"
              color="failure"
            >
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
