import { useRouter } from 'next/router';

const EventEnd = () => {
  const router = useRouter();
  const { teamName, logo, bg, bgColor } = router.query; 

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${bg})`, 
        backgroundColor: bgColor, 
      }}
    >
      <img src={logo} alt="Team Logo" className="w-40 h-40 mb-4" /> 
      <h1 className="text-4xl font-bold text-white mb-2">Congratulations!</h1> 
      <h2 className="text-2xl text-yellow-400 mb-4">Team: {teamName}</h2>
      <p className="text-xl text-white">Please go to Old Mess.</p>
    </div>
  );
};

export default EventEnd;


