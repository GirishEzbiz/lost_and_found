import Link from 'next/link'
import React from 'react'

export default function Support() {
    return (
        <div className='container position-absolute bottom-0'>
            <div className='d-flex justify-content-between'>
                <div>
                    <button className='text-center border-0 bg-transparent'>
                        <svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.341187" y="0.234924" width="55" height="59.1498" rx="16" fill="#D0EDFB" />
                            <path d="M21.6689 31.7979C19.8376 32.8883 15.0361 35.1148 17.9606 37.901C19.3891 39.2619 20.9802 40.2353 22.9805 40.2353H34.3949C36.3952 40.2353 37.9863 39.2619 39.4148 37.901C42.3393 35.1148 37.5378 32.8883 35.7065 31.7979C31.4122 29.2408 25.9632 29.2408 21.6689 31.7979Z" stroke="#2EB7FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M34.5124 20.172C34.5124 23.389 31.9046 25.9969 28.6876 25.9969C25.4707 25.9969 22.8628 23.389 22.8628 20.172C22.8628 16.9551 25.4707 14.3472 28.6876 14.3472C31.9046 14.3472 34.5124 16.9551 34.5124 20.172Z" stroke="#2EB7FA" stroke-width="1.5" />
                        </svg>
                        <h5 class="card-title mt-3 fs-14">Home</h5>
                    </button>
                </div>
                <div>
                    <button className='text-center border-0 bg-transparent'>
                        <svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.341187" y="0.234924" width="55" height="59.1498" rx="16" fill="#D0EDFB" />
                            <path d="M21.6689 31.7979C19.8376 32.8883 15.0361 35.1148 17.9606 37.901C19.3891 39.2619 20.9802 40.2353 22.9805 40.2353H34.3949C36.3952 40.2353 37.9863 39.2619 39.4148 37.901C42.3393 35.1148 37.5378 32.8883 35.7065 31.7979C31.4122 29.2408 25.9632 29.2408 21.6689 31.7979Z" stroke="#2EB7FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M34.5124 20.172C34.5124 23.389 31.9046 25.9969 28.6876 25.9969C25.4707 25.9969 22.8628 23.389 22.8628 20.172C22.8628 16.9551 25.4707 14.3472 28.6876 14.3472C31.9046 14.3472 34.5124 16.9551 34.5124 20.172Z" stroke="#2EB7FA" stroke-width="1.5" />
                        </svg>
                        <h5 class="card-title mt-3 fs-14">items</h5>
                    </button>
                </div>
                <div>
                    <Link href="/scanner">
                        <button className='text-center border-0 bg-transparent'>
                            <svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.341187" y="0.234924" width="55" height="59.1498" rx="16" fill="#D0EDFB" />
                                <path d="M21.6689 31.7979C19.8376 32.8883 15.0361 35.1148 17.9606 37.901C19.3891 39.2619 20.9802 40.2353 22.9805 40.2353H34.3949C36.3952 40.2353 37.9863 39.2619 39.4148 37.901C42.3393 35.1148 37.5378 32.8883 35.7065 31.7979C31.4122 29.2408 25.9632 29.2408 21.6689 31.7979Z" stroke="#2EB7FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M34.5124 20.172C34.5124 23.389 31.9046 25.9969 28.6876 25.9969C25.4707 25.9969 22.8628 23.389 22.8628 20.172C22.8628 16.9551 25.4707 14.3472 28.6876 14.3472C31.9046 14.3472 34.5124 16.9551 34.5124 20.172Z" stroke="#2EB7FA" stroke-width="1.5" />
                            </svg>
                            <h5 class="card-title mt-3 fs-14">Scan</h5>
                        </button>
                    </Link>
                </div>
                <div>
                    <button className='text-center border-0 bg-transparent'>
                        <svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.341187" y="0.234924" width="55" height="59.1498" rx="16" fill="#D0EDFB" />
                            <path d="M21.6689 31.7979C19.8376 32.8883 15.0361 35.1148 17.9606 37.901C19.3891 39.2619 20.9802 40.2353 22.9805 40.2353H34.3949C36.3952 40.2353 37.9863 39.2619 39.4148 37.901C42.3393 35.1148 37.5378 32.8883 35.7065 31.7979C31.4122 29.2408 25.9632 29.2408 21.6689 31.7979Z" stroke="#2EB7FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M34.5124 20.172C34.5124 23.389 31.9046 25.9969 28.6876 25.9969C25.4707 25.9969 22.8628 23.389 22.8628 20.172C22.8628 16.9551 25.4707 14.3472 28.6876 14.3472C31.9046 14.3472 34.5124 16.9551 34.5124 20.172Z" stroke="#2EB7FA" stroke-width="1.5" />
                        </svg>
                        <h5 class="card-title mt-3 fs-14">notification</h5>
                    </button>
                </div>
                <div>
                    <button className='text-center border-0 bg-transparent'>
                        <svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.341187" y="0.234924" width="55" height="59.1498" rx="16" fill="#D0EDFB" />
                            <path d="M21.6689 31.7979C19.8376 32.8883 15.0361 35.1148 17.9606 37.901C19.3891 39.2619 20.9802 40.2353 22.9805 40.2353H34.3949C36.3952 40.2353 37.9863 39.2619 39.4148 37.901C42.3393 35.1148 37.5378 32.8883 35.7065 31.7979C31.4122 29.2408 25.9632 29.2408 21.6689 31.7979Z" stroke="#2EB7FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M34.5124 20.172C34.5124 23.389 31.9046 25.9969 28.6876 25.9969C25.4707 25.9969 22.8628 23.389 22.8628 20.172C22.8628 16.9551 25.4707 14.3472 28.6876 14.3472C31.9046 14.3472 34.5124 16.9551 34.5124 20.172Z" stroke="#2EB7FA" stroke-width="1.5" />
                        </svg>
                        <h5 class="card-title mt-3 fs-14">Profile</h5>
                    </button>
                </div>
            </div>
        </div>
    )
}
