
const HorizontalRule = () => {
  return (
    <div className="flex items-center justify-center w-full">
      <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
      <hr className="flex-grow border-t-2 border-black mx-2" />
      <hr className="flex-grow border-t-2 border-black mx-2" />
      <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
    </div>
  );
};

export default HorizontalRule;
