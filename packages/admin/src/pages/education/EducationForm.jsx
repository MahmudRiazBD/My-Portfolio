import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

const EducationForm = () => {
    const [institution, setInstitution] = useState('');
    const [degree, setDegree] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            const fetchEducation = async () => {
                setLoading(true);
                const { data, error } = await supabase
                    .from('education')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) {
                    console.error('Error fetching education:', error);
                } else {
                    setInstitution(data.institution);
                    setDegree(data.degree);
                    setStartDate(data.start_date);
                    setEndDate(data.end_date || '');
                    setDescription(data.description);
                }
                setLoading(false);
            };
            fetchEducation();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const educationData = {
            institution,
            degree,
            start_date: startDate,
            end_date: endDate || null,
            description
        };

        let error;
        if (id) {
            ({ error } = await supabase.from('education').update(educationData).eq('id', id));
        } else {
            ({ error } = await supabase.from('education').insert([educationData]));
        }

        if (error) {
            Swal.fire('Error', error.message, 'error');
        } else {
            Swal.fire('Success', `Education data ${id ? 'updated' : 'saved'} successfully!`, 'success');
            navigate('/admin/education');
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{id ? 'Edit' : 'Add'} Education</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-700">Institution</label>
                    <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Degree</label>
                    <input
                        type="text"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    ></textarea>
                </div>
                <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded">
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </form>
        </div>
    );
};

export default EducationForm;
