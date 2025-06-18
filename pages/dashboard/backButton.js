import { useRouter } from "next/router";
import { IoIosArrowBack } from "react-icons/io";
export const BackButton = ({ onClick }) => {
  return (
    <>
      <div style={styles.header} onClick={onClick}>
        {/* <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.57 5.92999L3.5 12L9.57 18.07"
          stroke="#19191A"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.5 12H3.67004"
          stroke="#19191A"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg> */}
        <IoIosArrowBack className="fs-3 " />
      </div>
    </>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // marginBottom: "20px",
  },
};

const GoBack = () => {
  const router = useRouter();

  const handleBack = () => {
    // Navigate directly to the dashboard page
    router.push("/dashboard"); // Adjust the URL if necessary
  };

  return (
    <div>
      <BackButton onClick={handleBack} />
      {/* Your other content */}
    </div>
  );
};

export default GoBack;
