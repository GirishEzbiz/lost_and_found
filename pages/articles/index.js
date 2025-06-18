import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner } from 'react-bootstrap';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/admin/blogs'); // Adjust the path if your API route is different
      const data = await res.json();
      setBlogs(data.data); // `data.data` matches the format in your backend `res.status(200).json({ data: rows, total })`
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5" style={{ color: '#ff6600', fontWeight: 'bold' }}>OUR LATEST ARTICLES</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="warning" />
        </div>
      ) : (   
        <div className="row gy-5">
          {blogs.map((blog) => (
            <div key={blog.id} className="col-12">
              <div className="d-flex flex-column flex-md-row align-items-center p-3 border rounded shadow-sm" style={{ backgroundColor: '#fff' }}>
                {/* Image */}
                <img
                  src={blog.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={blog.title}
                  className="img-fluid rounded"
                  style={{ width: '300px', height: '200px', objectFit: 'cover' }}
                />

                {/* Text */}
                <div className="ms-md-4 mt-3 mt-md-0 flex-grow-1">
                  <h4 style={{ color: '#ff6600', fontWeight: '600' }}>{blog.title}</h4>

                  <p
  className="text-muted"
  style={{ lineHeight: '1.6', height: '80px', overflow: 'hidden' }}
  dangerouslySetInnerHTML={{ __html: blog.content }}
></p>


                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
