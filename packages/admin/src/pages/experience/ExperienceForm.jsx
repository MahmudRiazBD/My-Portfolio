import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

const ExperienceForm = () => {
    const [company, setCompany] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            const fetchExperience = async () => {
                setLoading(true);
                const { data, error } = await supabase
                    .from('experience')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) {
                    console.error('Error fetching experience:', error);
                } else {
                    setCompany(data.company);
                    setJobTitle(data.job_title);
                    setStartDate(data.start_date);
                    setEndDate(data.end_date || '');
                    setDescription(data.description);
                }
                setLoading(false);
            };
            fetchExperience();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const experienceData = {
            company,
            job_title: jobTitle,
            start_date: startDate,
            end_date: endDate || null,
            description
        };

        let error;
        if (id) {
            ({ error } = await supabase.from('experience').update(experienceData).eq('id', id));
        } else {
            ({ error } = await supabase.from('experience').insert([experienceData]));
        }

        if (error) {
            Swal.fire('Error', error.message, 'error');
        } else {
            Swal.fire('Success', `Experience data ${id ? 'updated' : 'saved'} successfully!`, 'success');
            navigate('/admin/experience');
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{id ? 'Edit' : 'Add'} Experience</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-700">Company</label>
                    <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Job Title</label>
                    <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
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

export default ExperienceForm;
