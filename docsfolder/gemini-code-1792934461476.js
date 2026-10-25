// Constant API URL
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// DOM Elements
const loadBtn = document.getElementById('load-btn');
const statusP = document.getElementById('status');
const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const submitBtn = document.getElementById('submit-btn');
const notesList = document.getElementById('notes-list');

// Helper to set UI loading state and disable/enable buttons
function setBusyState(isBusy, message = '') {
  loadBtn.disabled = isBusy;
  submitBtn.disabled = isBusy;

  // Disable any dynamically generated delete buttons
  const deleteBtns = notesList.querySelectorAll('button');
  deleteBtns.forEach(btn => btn.disabled = isBusy);

  if (message) {
    statusP.textContent = message;
  }
}

// Reusable async function request that handles fetch, response.ok checks, and errors
async function request(endpoint = '', options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Jsonplaceholder returns JSON for GET/POST, but empty object for DELETE
  return await response.json();
}

// Function to render notes safely using textContent
function renderNotes(notes) {
  notesList.textContent = ''; // Clear existing items safely

  if (!notes || notes.length === 0) {
    statusP.textContent = 'No notes found.';
    return;
  }

  notes.forEach(note => {
    const li = document.createElement('li');
    li.dataset.id = note.id;

    const h3 = document.createElement('h3');
    h3.textContent = note.title;

    const p = document.createElement('p');
    p.textContent = note.body;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteNote(note.id, li));

    li.appendChild(h3);
    li.appendChild(p);
    li.appendChild(deleteBtn);

    notesList.appendChild(li);
  });
}

// GET: Load 10 notes
async function loadNotes() {
  setBusyState(true, 'Loading notes...');
  try {
    const data = await request('?_limit=10');
    renderNotes(data);
    if (data.length > 0) {
      statusP.textContent = 'Notes loaded successfully!';
    }
  } catch (error) {
    statusP.textContent = `Error loading notes: ${error.message}`;
  } finally {
    setBusyState(false);
  }
}

// POST: Create a new note
async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // Validation: Title required and max 100 characters
  if (!title) {
    statusP.textContent = 'Validation error: Title is required.';
    return;
  }

  if (title.length > 100) {
    statusP.textContent = 'Validation error: Title must be 100 characters or fewer.';
    return;
  }

  setBusyState(true, 'Creating note...');

  try {
    const newNote = await request('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, body, userId: 1 })
    });

    // Render newly created note at the top of the list
    const li = document.createElement('li');
    li.dataset.id = newNote.id;

    const h3 = document.createElement('h3');
    h3.textContent = newNote.title;

    const p = document.createElement('p');
    p.textContent = newNote.body;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteNote(newNote.id, li));

    li.appendChild(h3);
    li.appendChild(p);
    li.appendChild(deleteBtn);

    notesList.prepend(li);

    // Clear form inputs
    noteForm.reset();
    statusP.textContent = 'Note created successfully!';
  } catch (error) {
    statusP.textContent = `Error creating note: ${error.message}`;
  } finally {
    setBusyState(false);
  }
}

// DELETE: Remove a note
async function deleteNote(id, elementToRemove) {
  setBusyState(true, 'Deleting note...');

  try {
    await request(`/${id}`, {
      method: 'DELETE'
    });

    elementToRemove.remove();
    statusP.textContent = 'Note deleted successfully!';

    // Check if empty state needs to be displayed
    if (notesList.children.length === 0) {
      statusP.textContent = 'No notes found.';
    }
  } catch (error) {
    statusP.textContent = `Error deleting note: ${error.message}`;
  } finally {
    setBusyState(false);
  }
}

// Event Listeners
loadBtn.addEventListener('click', loadNotes);
noteForm.addEventListener('submit', createNote);