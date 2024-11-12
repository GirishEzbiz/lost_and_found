import Link from 'next/link';
import React from 'react';

export default function Support() {
    return (
        <div className='container position-absolute bottom-0'>
            <div className='d-flex justify-content-between'>
                <div>
                    <button className='text-center border-0 bg-transparent'>
                        <img src='assets/images/home.png' />
                        <h5 className="card-title mt-3 fs-14">Home</h5>
                    </button>
                </div>
                <div>
                    <button className='text-center border-0 bg-transparent'>
                        <img src='assets/images/items.png' />
                        <h5 className="card-title mt-3 fs-14">Items</h5>
                    </button>
                </div>
                <div>
                    <Link href="/scanner">
                        <button className='text-center border-0 bg-transparent'>
                            <img src='assets/images/scan.png' />
                            <h5 className="card-title mt-3 fs-14">Scan</h5>
                        </button>
                    </Link>
                </div>
                <div>
                    <button className='text-center border-0 bg-transparent'>
                        <img src='assets/images/notifications.png' />
                        <h5 className="card-title mt-3 fs-14">Notification</h5>
                    </button>
                </div>
                <div>
                    <button className='text-center border-0 bg-transparent'>
                        <img src='assets/images/profile.png' />
                        <h5 className="card-title mt-3 fs-14">Profile</h5>
                    </button>
                </div>
            </div>
        </div>
    );
}
