import './firms-filter.css';
import countries from '../../common/countries';
import t from '../../common/localization';
import { colorByMonth } from '../mapUtil';


export class FirmsFilter {

  constructor() {
    this.onDocumentClick = this.onDocumentClick.bind(this);
  }

  getDefaultPosition() {
    return 'top-right';
  }

  onAdd() {
    const me = this;

    me.controlContainer = document.createElement('div');
    me.controlContainer.id = 'firms-filter-control-container';
    me.controlContainer.classList.add('mapboxgl-ctrl');
    me.controlContainer.classList.add('mapboxgl-ctrl-group');
    me.controlContainer.classList.add('mapboxgl-ctrl-top-right');
    me.controlContainer.style.zIndex = 399;

    me.filterContainer = document.createElement('div');
    me.filterContainer.classList.add('mapboxgl-filter-container');
    me.controlContainer.appendChild(me.filterContainer);

    me.filterButton = document.createElement('button');
    me.filterButton.type = 'button';
    me.filterButton.title = 'Filter';
    me.filterButton.classList.add('mapboxgl-ctrl-icon');
    me.filterButton.classList.add('mapboxgl-firms-filter');
    me.filterButton.addEventListener('click', () => {
      me.filterButton.style.display = 'none';
      me.filterContainer.style.display = 'block';
    });

    const btnIcon = document.createElement('i');
    btnIcon.classList.add('fas');
    btnIcon.classList.add('fa-fire');
    me.filterButton.appendChild(btnIcon);

    
    me.controlContainer.appendChild(me.filterButton);

    // Add filters for searching FIRMS
    const firmsFilterDiv = document.createElement('div');

    const typeDiv = document.createElement('div');
    typeDiv.classList.add('inner');
    const typeLabel = document.createElement('label');
    typeLabel.innerText = `${t('type')}:`;
    typeDiv.appendChild(typeLabel);
    const typeSelect = document.createElement('select');
    typeSelect.name = 'filter_type';
    typeSelect.style.float = 'right';
    ['hot_spots', 'burned_areas'].forEach((t1) => {
      const option = document.createElement('option');
      option.value = t1;
      option.innerText = t(t1);
      typeSelect.appendChild(option);
    })
    typeDiv.appendChild(typeSelect);
    firmsFilterDiv.appendChild(typeDiv);


    const countryDiv = document.createElement('div');
    countryDiv.classList.add('inner');
    const countryLabel = document.createElement('label');
    countryLabel.innerText = `${t('country')}:`;
    countryDiv.appendChild(countryLabel);
    const countrySelect = document.createElement('select');
    countrySelect.name = 'filter_country';
    countrySelect.style.float = 'right';
    countries.forEach((country) => {
      const option = document.createElement('option');
      option.value = country.name;
      option.innerText = country.name;
      countrySelect.appendChild(option);
    })
    countryDiv.appendChild(countrySelect);
    firmsFilterDiv.appendChild(countryDiv);

    const today = new Date();
    const yearDiv = document.createElement('div');
    yearDiv.classList.add('inner');
    const yearLabel = document.createElement('label');
    yearLabel.innerText = `${t('year')}:`;
    yearDiv.appendChild(yearLabel);
    const yearSelect = document.createElement('select');
    yearSelect.name = 'filter_year';
    yearSelect.style.float = 'right';
    Array(today.getFullYear() - 2000 + 1).fill().map((v, i) => i + 2000).forEach((year) => {
      const option = document.createElement('option');
      option.value = year;
      option.innerText = year;
      yearSelect.appendChild(option);
    })
    yearDiv.appendChild(yearSelect);
    firmsFilterDiv.appendChild(yearDiv);
    
    const monthDiv = document.createElement('div');
    monthDiv.classList.add('inner');
    const monthLabel = document.createElement('label');
    monthLabel.innerText = `${t('month')}:`;
    monthDiv.appendChild(monthLabel);
    const monthSelect = document.createElement('ui');
    Array(12).fill().map((v, i) => i + 1).forEach((month) => {
      const optionLi = document.createElement('li');
      //option.value = month;
      //option.innerText = t(`months`)[month-1];
      const optionCheckbox = document.createElement('input');
      optionCheckbox.type = 'checkbox';
      optionCheckbox.name = 'filter_month';
      optionCheckbox.value = t(`months`)[month-1];
      optionLi.appendChild(optionCheckbox);
      
      const optionLabel = document.createElement('label');
      optionLabel.innerText = t('months')[month-1];
      optionLabel.style.backgroundColor = colorByMonth(month);
      optionLi.appendChild(optionLabel);

      monthSelect.appendChild(optionLi);
    })
    monthDiv.appendChild(monthSelect);
    firmsFilterDiv.appendChild(monthDiv);
    

    const searchBtn = document.createElement('button');
    searchBtn.id = 'firms-search';
    searchBtn.innerHTML = `<span><i class="fa fa-search"></i>&nbsp;${t('search')}</span>`;
    searchBtn.classList.add('search');

    firmsFilterDiv.appendChild(searchBtn);
    me.filterContainer.appendChild(firmsFilterDiv);

    document.addEventListener('click', me.onDocumentClick);
    return me.controlContainer;
  }

  onRemove() {
    if (!this.controlContainer || !this.controlContainer.parentNode || !this.filterButton) {
      return;
    }
    this.filterButton.removeEventListener('click', this.onDocumentClick);
    this.controlContainer.parentNode.removeChild(this.controlContainer);
    document.removeEventListener('click', this.onDocumentClick);
  }

  onDocumentClick(event) {
    if (this.controlContainer && !this.controlContainer.contains(event.target) && this.filterContainer && this.filterButton) {
      this.filterContainer.style.display = 'none';
      this.filterButton.style.display = 'block';
    }
  }
}
