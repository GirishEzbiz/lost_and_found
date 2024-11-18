import React from "react";
import Support from "./support";

const ListItem = () => {
  return (
    <>
    <div style={styles.container}>
    <div style={styles.header}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.57 5.92999L3.5 12L9.57 18.07" stroke="#19191A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.5 12H3.67004" stroke="#19191A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>     
      </div>
        <h2 className="text-center">List item</h2>
      <div style={styles.searchBar} className="mt-3">
        <input type="text" placeholder="Search item" style={styles.searchInput} />
      </div>
        <button className="float-end" style={styles.addButton}>+ Add Item</button>
    </div>
    <div className="container">
      {/* Item Groups */}
      <div style={styles.itemGroup}>
        {/* Group 1 */}
        <div style={styles.group} className="mt-1">
          <h3 style={styles.groupTitle}>Item 1</h3>
          <div style={styles.cardContainer}>
            {[1, 2, 3,4].map((item) => (
              <div key={item} style={styles.card}>
                <div style={styles.imagePlaceholder}></div>
                <p style={styles.cardText}>Name</p>
                <p style={styles.cardText}>Details</p>
                <p style={styles.cardText}>Description</p>
              </div>
            ))}
          </div>
        </div>

        {/* Group 2 */}
        <div style={styles.group}>
          <h3 style={styles.groupTitle}>Item 2</h3>
          <div style={styles.cardContainer}>
            {[1, 2, 3,4].map((item) => (
              <div key={item} style={styles.card}>
                <div style={styles.imagePlaceholder}></div>
                <p style={styles.cardText}>Name</p>
                <p style={styles.cardText}>Details</p>
                <p style={styles.cardText}>Description</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <Support />
    </>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#fff",
    fontFamily: "'Arial', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  backButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
    textAlign: "center",
  },
  qrButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  searchInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
    backgroundColor: "transparent",
  },
  addButton: {
    backgroundColor: "#ff8a8a",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "10px 20px",
    fontSize: "14px",
    cursor: "pointer",
  },
  group: {
    // backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    padding: "15px",
  },
  groupTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  cardContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "space-between",
  },
  card: {
    flex: "1",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "5px",
    textAlign: "center",
    padding: "10px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100px",
    backgroundImage: "url('https://s3-alpha-sig.figma.com/img/0757/01e1/dd67a6058c3f58440ff70a9c679b5e98?Expires=1733097600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Jcsh4orADa76qhv~B9YsAsUTZ0YaOeE8bHgWKnzv5ntcHUdl9Bt3gsdtLHZCRSBvkXVB96QMPX0aecnjZkNAsqC5f391hqRT1Iu29xn2HvjyWhwCPZazMVkEsBa3jPArfH2BQSUjZgL9cKnSls7EeRD7CuFJU5ye21PLLqxjar7NdAlEIvt4heVCjGO5yBj1VDm4jSGUzy9ZLIX9nMT4v1ITXe0fizt1Mr-OOQVQrp1W4Kh2Euh4HzgebkNSX2OfMpo9cVtUHaUqU5Z4c~xJGnJgpt8XG8txF8P8Ibt~3Srg~1B-K3eegGcAOaKO88Q2cOigGWNcMpafbvLry4lQ~Q__')",
    backgroundSize: "cover",
    backgroundPosition: "center",

    borderRadius: "5px",
    marginBottom: "10px",
  },
  cardText: {
    fontSize: "12px",
    margin: "5px 0",
  },
};

export default ListItem;
