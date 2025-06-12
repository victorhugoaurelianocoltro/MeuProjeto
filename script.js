const API_URL = 'http://localhost:3000/api/receitas';

const formSection = document.getElementById('form-section');
const recipesSection = document.getElementById('recipes-section');
const goToPublicarBtn = document.getElementById('go-to-publicar');
const goToRecipesBtn = document.getElementById('go-to-recipes');

function showForm() {
  formSection.classList.add('active');
  recipesSection.classList.remove('active');
  formSection.style.display = '';
  recipesSection.style.display = 'none';
}
function showRecipes() {
  formSection.classList.remove('active');
  recipesSection.classList.add('active');
  formSection.style.display = 'none';
  recipesSection.style.display = '';
  applyFilters();
}
if (goToPublicarBtn) goToPublicarBtn.onclick = showForm;
if (goToRecipesBtn) goToRecipesBtn.onclick = showRecipes;

// Preview da imagem
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photo-preview');
let photoData = '';
if (photoInput) {
  photoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        photoData = evt.target.result;
        photoPreview.src = photoData;
        photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      photoData = '';
      photoPreview.src = '';
      photoPreview.style.display = 'none';
    }
  });
}

// Adicionar receita na API
async function addRecipe(recipe) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe)
  });
  return await res.json();
}

// Buscar receitas da API
async function getRecipes() {
  const res = await fetch(API_URL);
  return await res.json();
}

// Deletar receita na API
async function deleteRecipe(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  } catch (e) {
    alert('Erro ao apagar receita!');
  }
}

// Renderização dos cards de receitas
function renderRecipes(recipes) {
  const list = document.getElementById('recipes-list');
  list.innerHTML = '';
  if (!recipes.length) {
    list.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#8b2e1a;">Nenhuma receita encontrada.</p>';
    return;
  }
  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <div class="recipe-image-container">
        <img src="${recipe.photo || 'https://via.placeholder.com/300x120?text=Sem+Foto'}" alt="${recipe.name}">
        <div class="recipe-title-overlay">${recipe.name}</div>
        <div class="recipe-time-overlay">${recipe.time} <span style="font-size:1.1em;">⏲️</span></div>
        <button class="delete-btn" title="Apagar receita">🗑️</button>
      </div>
      <div class="recipe-info">
        <div class="recipe-meta"><b>Categoria:</b> ${recipe.category}</div>
        <div class="recipe-meta"><b>Dificuldade:</b> ${recipe.difficulty}</div>
        <div class="recipe-meta"><b>Ingredientes:</b> ${recipe.ingredients}</div>
        <div class="recipe-meta"><b>Modo de preparo:</b> ${recipe.instructions}</div>
      </div>
    `;
    // Botão de deletar
    const delBtn = card.querySelector('.delete-btn');
    delBtn.style.display = '';
    delBtn.onclick = async () => {
      if (confirm('Tem certeza que deseja apagar esta receita?')) {
        await deleteRecipe(recipe.id);
        await applyFilters();
      }
    };
    list.appendChild(card);
  });
}

// Filtros
let currentCategory = 'Todo';
let currentSearch = '';
async function applyFilters() {
  let recipes = await getRecipes();
  if (currentCategory !== 'Todo') {
    recipes = recipes.filter(r => r.category === currentCategory);
  }
  if (currentSearch.trim()) {
    const s = currentSearch.trim().toLowerCase();
    recipes = recipes.filter(r =>
      r.name.toLowerCase().includes(s) ||
      r.ingredients.toLowerCase().includes(s)
    );
  }
  renderRecipes(recipes);
}

// Eventos de filtro
const searchInput = document.getElementById('search');
if (searchInput) {
  searchInput.addEventListener('input', e => {
    currentSearch = e.target.value;
    applyFilters();
  });
}
if (document.getElementById('category-bar')) {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      applyFilters();
    });
  });
  document.querySelector('.category-btn[data-category="Todo"]').classList.add('active');
}

// Cadastro de receita
const form = document.getElementById('recipe-form');
if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const recipe = {
      photo: photoData,
      name: document.getElementById('name').value.trim(),
      ingredients: document.getElementById('ingredients').value.trim(),
      instructions: document.getElementById('instructions').value.trim(),
      category: document.getElementById('category').value,
      difficulty: document.getElementById('difficulty').value.trim(),
      time: document.getElementById('time').value.trim()
    };
    if (!recipe.name || !recipe.ingredients || !recipe.instructions || !recipe.difficulty || !recipe.time) {
      alert('Preencha todos os campos!');
      return;
    }
    await addRecipe(recipe);
    form.reset();
    photoData = '';
    photoPreview.src = '';
    photoPreview.style.display = 'none';
    showRecipes();
  });
}

// Inicialização: mostrar só o formulário primeiro
document.addEventListener('DOMContentLoaded', () => {
  showForm();
});