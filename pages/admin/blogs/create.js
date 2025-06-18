import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'

import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import BlogForm from './BlogForm'


const CreateBlog = () => {
  
  
  return (
    <>
     <Container fluid className="p-6" style={{  width:"98%", marginTop:"-35px"  }}>
      <Row className="align-items-center my-4">
        <Col>
          <h3>Add Blog</h3>
        </Col>
        <Col className="text-end">
          <Link href="/admin/blogs" passHref>
            <Button variant="primary" className=""> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
          </Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <BlogForm/>
        </Card.Body>
      </Card>
    </Container>

    </>
  )
}

export default CreateBlog