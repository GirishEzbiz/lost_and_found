import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'

import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import TeamForm from './TeamForm'


const CreateUser = () => {
  
  
  return (
    <>
     <Container fluid className="p-6" style={{  width:"98%", marginTop:"-35px"  }}>
      <Row className="align-items-center my-4">
        <Col>
          <h3>Add team</h3>
        </Col>
        <Col className="text-end">
          <Link href="/admin/teams" passHref>
            <Button  className="" style={{ backgroundColor: '#a22191', border: 'none' }}> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
          </Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <TeamForm/>
        </Card.Body>
      </Card>
    </Container>

    </>
  )
}

export default CreateUser