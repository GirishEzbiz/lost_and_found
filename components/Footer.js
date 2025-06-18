const Footer = ({ executionTime }) => {
    return (
      <footer className="fixed bottom-0 w-full  text-white text-center text-sm" style={{backgroundColor:"#717077"}}>
        <div className="m-0 p-1 d-flex justify-content-between">
          <p className="m-0">Powered by Qritagya v3.1</p>
          <p className="m-0">Executed in {executionTime} seconds.</p>
        </div>
      </footer>
    );
  };
  
  

export default Footer;
