import Link from 'next/link';

const welcome = () => {
    return (
        <div className="container px-3">
            <div className="row pt-4">
                <div className='col'>
                    <h1 className="text-center fw-bold mt-5">Welcome to</h1>
                    <img src='assets/images/Mask-group.png' className='w-100 my-5' />
                    <button type="button" class="btn createaccount mb-3 mt-5 p-3" fdprocessedid="eznc9a">Create account</button>
                    <button type="button" class="btn createlogin mb-3 p-3" fdprocessedid="eznc9a">Login</button>
                </div>
            </div>
        </div>
    );
};

export default welcome;
