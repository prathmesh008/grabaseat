'use client'
import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Cross2Icon, PlusIcon, UploadIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import axios from 'axios';
import authHeader from '@/services/authHeader';
import config from '@/app/config';

const AddNewEvents = ({ onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    location: "College Auditorium",
    poster: null,
    banner: null,
  });

  const [sections, setSections] = useState([
    { name: "General", price: 0, rows: 10, cols: 10 }
  ]);

  const handleData = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setEventData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    } else {
      setEventData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);
  };

  const addSection = () => {
    setSections([...sections, { name: "New Section", price: 0, rows: 5, cols: 5 }]);
  };

  const removeSection = (index) => {
    if (sections.length > 1) {
      const updatedSections = sections.filter((_, i) => i !== index);
      setSections(updatedSections);
    } else {
      toast.error("At least one section is required");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!eventData.title || !eventData.date || !eventData.time) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", eventData.title);
      formData.append("description", eventData.description);
      formData.append("category", eventData.category);
      formData.append("date", eventData.date);
      formData.append("time", eventData.time);
      formData.append("location", eventData.location);
      formData.append("poster", eventData.poster);
      formData.append("banner", eventData.banner);

      // Serialize sections
      formData.append("sections", JSON.stringify(sections));

      // Calculate total seats/base price for quick ref if needed (logic handled in backend mostly)
      const basePrice = Math.min(...sections.map(s => Number(s.price)));
      formData.append("basePrice", basePrice);

      await axios.post(`${config.API_URL}/events`, formData, {
        headers: {
          ...authHeader(), // Ensure this returns { 'x-access-token': ... }
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Event created successfully!");
      if (onCreated) onCreated();
      if (onClose) onClose();

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 p-8 w-full h-full relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Create New Event</h2>
          <p className="text-zinc-500 text-sm">Fill in the details to publish an event.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column: Basic Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Event Title</label>
              <input
                type="text"
                name="title"
                value={eventData.title}
                onChange={handleData}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-lg placeholder:text-zinc-700"
                placeholder="e.g. Summer Music Festival"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Category</label>
                <select
                  name="category"
                  value={eventData.category}
                  onChange={handleData}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none"
                >
                  <option value="">Select...</option>
                  <option value="Concert">Concert</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Tech">Tech</option>
                  <option value="Competition">Competition</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  name="location"
                  value={eventData.location}
                  onChange={handleData}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleData}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Time</label>
                <input
                  type="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleData}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleData}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                placeholder="Describe your event..."
              />
            </div>
          </div>

          {/* Right Column: Media & Tickets */}
          <div className="space-y-8">
            {/* Media Uploads */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Poster (Vertical)</label>
                <div className="relative group">
                  <input type="file" name="poster" onChange={handleData} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="h-32 bg-zinc-900 border border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center text-zinc-500 group-hover:bg-zinc-800 group-hover:border-zinc-500 transition-all">
                    {eventData.poster ? (
                      <span className="text-emerald-500 font-medium text-xs truncate max-w-[80%]">{eventData.poster.name}</span>
                    ) : (
                      <>
                        <UploadIcon className="w-5 h-5 mb-2" />
                        <span className="text-xs">Upload Image</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Banner (Wide)</label>
                <div className="relative group">
                  <input type="file" name="banner" onChange={handleData} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="h-32 bg-zinc-900 border border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center text-zinc-500 group-hover:bg-zinc-800 group-hover:border-zinc-500 transition-all">
                    {eventData.banner ? (
                      <span className="text-emerald-500 font-medium text-xs truncate max-w-[80%]">{eventData.banner.name}</span>
                    ) : (
                      <>
                        <UploadIcon className="w-5 h-5 mb-2" />
                        <span className="text-xs">Upload Image</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Management */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ticket Sections</label>
                <button type="button" onClick={addSection} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                  <PlusIcon /> Add Section
                </button>
              </div>

              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {sections.map((section, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center text-sm p-3 bg-zinc-950/50 rounded-xl border border-white/5">
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Name"
                        value={section.name}
                        onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                        className="w-full bg-transparent border-b border-white/10 py-1 focus:border-indigo-500 focus:outline-none placeholder:text-zinc-700"
                      />
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center">
                        <span className="text-zinc-500 mr-1">₹</span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={section.price}
                          onChange={(e) => handleSectionChange(index, 'price', e.target.value)}
                          className="w-full bg-transparent border-b border-white/10 py-1 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <input
                        type="number"
                        placeholder="R"
                        title="Rows"
                        value={section.rows}
                        onChange={(e) => handleSectionChange(index, 'rows', e.target.value)}
                        className="w-full bg-transparent border-b border-white/10 py-1 text-center focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2 text-center">
                      <input
                        type="number"
                        placeholder="C"
                        title="Cols"
                        value={section.cols}
                        onChange={(e) => handleSectionChange(index, 'cols', e.target.value)}
                        className="w-full bg-transparent border-b border-white/10 py-1 text-center focus:outline-none"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="text-white/20 hover:text-rose-500 transition-colors"
                      >
                        <Cross2Icon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/5 gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="bg-transparent border border-zinc-700 text-zinc-300 font-semibold px-6 py-2 rounded-xl hover:bg-zinc-900 transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className="bg-white text-zinc-950 font-semibold px-8 py-2 rounded-xl hover:bg-zinc-200 transition-colors"
          >
            {loading ? 'Publishing...' : 'Publish Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddNewEvents;