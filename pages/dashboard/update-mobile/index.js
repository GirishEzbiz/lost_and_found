'use client'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import Swal from 'sweetalert2'
import getUser from 'utils/getUserDetails'

const UpdateMobilePage = () => {
  const [mobile, setMobile] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [user, setUser] = useState({})

  const router = useRouter()


  useEffect(() => {
    const fetchUser = async () => {
      const data = await getUser(); // ⬅️ calling the imported function
      setUser(data.user); // update state in this component
    };
    fetchUser();
  }, []);

  const handleSendOtp = async () => {
    try {
      let data = await fetch('/api/update-mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, userId: user.id }),
      })
      if (data.status == 200) {
        setOtpSent(true)
      }
    } catch (error) {
      console.error('Error sending OTP:', error)

    }


  }


  const handleVerifyOtp = async () => {
    try {
      const res = await fetch('/api/update-mobile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp, userId: user.id, mobile }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: data.message || 'Mobile number updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        router.push('/dashboard')

      } else {
        Swal.fire({
          title: 'Error!',
          text: data.message || 'Failed to verify OTP.',
          icon: 'error',
          confirmButtonText: 'Try Again',
        });
      }

    } catch (error) {
      console.error('Error verifying OTP:', error);
      Swal.fire({
        title: 'Unexpected Error',
        text: 'Something went wrong. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h5 className="mb-4 fw-bold text-center">Update Your Mobile Number</h5>

      <Form.Group className="mb-3">
        <Form.Label>New Mobile Number</Form.Label>
        <Form.Control
          type="tel"
          placeholder="Enter 10-digit number"
          value={mobile}
          maxLength={10}
          onChange={(e) => setMobile(e.target.value.replace(/\D/, ''))}
        />
      </Form.Group>

      {!otpSent ? (
        <Button variant="warning" className="w-100 mb-3" onClick={handleSendOtp}>
          Send OTP
        </Button>
      ) : (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Enter OTP</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </Form.Group>
          <Button variant="success" className="w-100" onClick={handleVerifyOtp}>
            Verify & Update
          </Button>
        </>
      )}
    </div>
  )
}

export default UpdateMobilePage
