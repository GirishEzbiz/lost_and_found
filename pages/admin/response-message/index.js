import Select from "react-select";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Container,
  Pagination,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import Cookies from "js-cookie";

const ResponseMessage = () => {
  const [skus, setSkus] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = Cookies.get("Page-limit") || 10;
  const [totalCount, setTotalCount] = useState(0);
const [rset,setRset] = useState(false)


  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = `/api/admin/response_message?page=${currentPage}&limit=${pageSize}`;
      if (selectedSKU) query += `&sku_id=${selectedSKU.value}`;
      if (selectedBrand) query += `&brand_id=${selectedBrand.value}`;

      const res = await fetch(query);
      const data = await res.json();

      setSkus(data?.skuList);
      setBrands(data?.brandList);
      setTotalCount(data?.total || 0);

      const parsedMessages = data?.data?.map((item) => {
        const parsed = JSON.parse(item.message);
        return {
          sku: item.sku_name,
          id: item.id,
          sku_id: item.sku_id,
          brand: item.brand_name,
          brand_id: item.brand_id,
          success: parsed.success,
          invalid: parsed.invalid,
          notActive: parsed.notActive,
          expired: parsed.expired,
          fake: parsed.fake,
          blacklisted: parsed.blacklisted,
        };
      });

      setFilteredMessages(parsedMessages);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage,rset]);       

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when filtering
    fetchData();
  };

  const resetFilters = () => {
      setSelectedSKU(null);
      setSelectedBrand(null);
      setCurrentPage(1);
      setRset(!rset)
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      zIndex: 10,  // Increase z-index of select control
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,  // Increase z-index of dropdown menu
    }),
  };

  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>Response Message</h3>
        </Col>
        <Col className="text-end">
          <Button onClick={() => router.push("/admin/response-message/create")}>
            + Create Template
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header>
          <Row className="align-items-center">
            <Col md={3}>
              <Select
                options={skus?.map((sku) => ({ label: sku.name, value: sku.id }))}
                value={selectedSKU}
                onChange={setSelectedSKU}
                placeholder="Select SKU"
                styles={customSelectStyles} // Apply custom styles here
              />
            </Col>
            <Col md={3}>
              <Select
                options={brands?.map((brand) => ({ label: brand.name, value: brand.id }))}
                value={selectedBrand}
                onChange={setSelectedBrand}
                placeholder="Select Brand"
                styles={customSelectStyles} // Apply custom styles here
              />
            </Col>
            <Col md={3}>
              <Button variant="primary" className="me-2" onClick={handleSearch}>
                Search
              </Button>
              <Button variant="secondary" onClick={resetFilters}>
                Reset Filters
              </Button>
            </Col>
          </Row>
          <p className="mt-2">Showing {filteredMessages?.length} out of {totalCount}</p>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : filteredMessages?.length === 0 ? (
            <div className="text-center my-5">
              <h5 className="text-muted">No Data Found</h5>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table className="table text-center ">
                  <thead className="table-light sticky-top bg-white">
                    <tr>
                      <th>#</th>
                      <th>SKU Name</th>
                      <th>Brand Name</th>
                      <th>Success</th>
                      <th>Invalid</th>
                      <th>Not Active</th>
                      <th>Expired</th>
                      <th>Fake</th>
                      <th>Blacklisted</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages?.map((item, index) => (
                      <tr key={item.id}>
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>{item.sku}</td>
                        <td>{item.brand}</td>
                        <td dangerouslySetInnerHTML={{ __html: item.success }} />
                        <td dangerouslySetInnerHTML={{ __html: item.invalid }} />
                        <td dangerouslySetInnerHTML={{ __html: item.notActive }} />
                        <td dangerouslySetInnerHTML={{ __html: item.expired }} />
                        <td dangerouslySetInnerHTML={{ __html: item.fake }} />
                        <td dangerouslySetInnerHTML={{ __html: item.blacklisted }} />
                        <td>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => router.push(`/admin/response-message/edit/${item.id}`)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-end p-3">
                <Pagination className="mb-0">
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      );
                    })
                    .map((page, index, arr) => {
                      const prev = arr[index - 1];
                      const items = [];

                      if (prev && page - prev > 1) {
                        items.push(<Pagination.Ellipsis key={`ellipsis-${page}`} disabled />);
                      }

                      items.push(
                        <Pagination.Item
                          key={`page-${page}`}
                          active={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );

                      return items;
                    })}
                  <Pagination.Next
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResponseMessage;
