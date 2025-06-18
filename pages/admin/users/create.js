import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import UsersForm from './UsersForm'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'


const CreateUser = () => {
  
  
  return (
    <>
     <Container fluid className="p-6">
      <Row className="align-items-center my-4">
        <Col>
          <h3>Add User</h3>
        </Col>
        <Col className="text-end">
          <Link href="/admin/users" passHref>
            <Button variant="danger" className=""> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
          </Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <UsersForm/>
        </Card.Body>
      </Card>
    </Container>

    </>
  )
}

export default CreateUser