import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import axios from 'axios';
import api from '@/utils/api';
import { useDispatch, useSelector } from 'react-redux';
import {setProfileComplete} from '@/redux/userSlice';

export default function CollegeDetails() {
    // State variables to hold form data
    const [collegeName, setCollegeName] = React.useState('');
    const [phone, setPhoneNumber] = React.useState('');
    const [collegeAddress, setCollegeAddress] = React.useState('');
    const [Name, setName] = React.useState('');
    const isProfileComplete = useSelector((state) => state.user.isProfileComplete);

    const dispatch = useDispatch();

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await api.post('api/save-user-details', {
                collegeName,
                phone,
                collegeAddress,
                Name
            }, {
                withCredentials: true
            });

            alert("User details saved successfully!");

            //update isprofileComplete state in redux
            dispatch(setProfileComplete(true)); 
           
        } catch (error) {
            console.error('Error saving user details:', error);
        }
    
    }     

    return (
         <div>
            <form>
                <div className="grid  items-center gap-4">
                    <div className='flex items-center gap-4 flex-wrap'>
                        <div className="grid w-full max-w-sm items-center gap-3">
                            <Label htmlFor="authorityName">Authority Name</Label>
                            <Input type="text" id="authorityName" placeholder="Enter Authority Name" value={Name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="grid w-full max-w-sm items-center gap-3">
                            <Label htmlFor="collegeName">College Name</Label>
                            <Input type="text" id="collegeName" placeholder="Enter College Name" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} />
                        </div>

                        <div className="grid w-full max-w-sm items-center gap-3">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input type="tel" id="phoneNumber" placeholder="Enter Phone Number" value={phone} onChange={(e) => setPhoneNumber(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="collegeAddress">College Address</Label>
                        <Input type="text" id="collegeAddress" placeholder="Enter College Address" value={collegeAddress} onChange={(e) => setCollegeAddress(e.target.value)} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:flex-row">
                        <Button onClick={handleSubmit}>Submit</Button>
                    </div>
                </div>

            </form>
        </div>
    )
}
