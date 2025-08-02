import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const EducationList = () => {
    const [education, setEducation] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEducation = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('education')
                .select('*')
                .order('start_date', { ascending: false });
            
            if (error) {
                console.error('Error fetching education:', error);
            } else {
                setEducation(data);
            }
            setLoading(false);
        };
        fetchEducation();
    }, []);

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { error } = await supabase.from('education').delete().eq('id', id);
                if (error) {
                    Swal.fire('Error', error.message, 'error');
                } else {
                    setEducation(education.filter(e => e.id !== id));
                    Swal.fire('Deleted!', 'The education entry has been deleted.', 'success');
                }
            }
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Education Management</h1>
                <Link to="/admin/education/new" className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
                    <PlusCircle className="mr-2" /> Add New
                </Link>
            </div>
            <div className="bg-white shadow-md rounded my-6">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Institution</th>
                            <th className="py-3 px-6 text-left">Degree</th>
                            <th className="py-3 px-6 text-center">Start Date</th>
                            <th className="py-3 px-6 text-center">End Date</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {education.map(edu => (
                            <tr key={edu.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{edu.institution}</td>
                                <td className="py-3 px-6 text-left">{edu.degree}</td>
                                <td className="py-3 px-6 text-center">{edu.start_date}</td>
                                <td className="py-3 px-6 text-center">{edu.end_date || 'Present'}</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <Link to={`/admin/education/edit/${edu.id}`} className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                            <Edit />
                                        </Link>
                                        <button onClick={() => handleDelete(edu.id)} className="w-4 mr-2 transform hover:text-red-500 hover:scale-110">
                                            <Trash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EducationList;
