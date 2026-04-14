const LISTING_URL = "{{ listingInfo.Url }}";

const PACKAGES = {
{{~ for package in packages ~}}
  "{{ package.Name }}": {
    name: "{{ package.Name }}",
    displayName: "{{ if package.DisplayName; package.DisplayName; end; }}",
    description: "{{ if package.Description; package.Description; end; }}",
    version: "{{ package.Version }}",
    author: {
      name: "{{ if package.Author.Name; package.Author.Name; end; }}",
      url: "{{ if package.Author.Url; package.Author.Url; end; }}",
    },
    dependencies: {
      {{~ for dependency in package.Dependencies ~}}
        "{{ dependency.Name }}": "{{ dependency.Version }}",
      {{~ end ~}}
    },
    keywords: [
      {{~ for keyword in package.Keywords ~}}
        "{{ keyword }}",
      {{~ end ~}}
    ],
    license: "{{ package.License }}",
    licensesUrl: "{{ package.LicensesUrl }}",
  },
{{~ end ~}}
};

(() => {
  const packageGrid = document.getElementById('packageGrid');
  const searchInput = document.getElementById('searchInput');

  // Search logic
  searchInput.addEventListener('input', ({ target: { value = '' }}) => {
    const cards = packageGrid.querySelectorAll('.package-card');
    cards.forEach(card => {
      const searchStr = value.toLowerCase();
      const matches = 
        card.dataset.packageName?.toLowerCase().includes(searchStr) ||
        card.dataset.packageId?.toLowerCase().includes(searchStr);
      
      card.style.display = matches ? 'flex' : 'none';
    });
  });

  // Help dialog
  const urlBarHelpButton = document.getElementById('urlBarHelp');
  const addListingToVccHelp = document.getElementById('addListingToVccHelp');
  urlBarHelpButton.addEventListener('click', () => {
    addListingToVccHelp.show();
  });

  // Copy listing URL
  const vccListingInfoUrlFieldCopy = document.getElementById('vccListingInfoUrlFieldCopy');
  vccListingInfoUrlFieldCopy.addEventListener('click', async () => {
    const vccUrlField = document.getElementById('vccListingInfoUrlField');
    await navigator.clipboard.writeText(vccUrlField.value);
    
    // Simple visual feedback
    const icon = vccListingInfoUrlFieldCopy.querySelector('md-icon');
    const oldIcon = icon.textContent;
    icon.textContent = 'check';
    setTimeout(() => { icon.textContent = oldIcon; }, 2000);
  });

  // Add Repo to VCC
  const vccAddRepoButton = document.getElementById('vccAddRepoButton');
  vccAddRepoButton.addEventListener('click', () => {
    window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
  });

  const rowAddToVccButtons = document.querySelectorAll('.rowAddToVccButton');
  rowAddToVccButtons.forEach(button => {
    button.addEventListener('click', () => {
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
    });
  });

  // Package info modal
  const packageInfoModal = document.getElementById('packageInfoModal');
  const packageInfoName = document.getElementById('packageInfoName');
  const packageInfoId = document.getElementById('packageInfoId');
  const packageInfoVersion = document.getElementById('packageInfoVersion');
  const packageInfoDescription = document.getElementById('packageInfoDescription');
  const packageInfoAuthor = document.getElementById('packageInfoAuthor');
  const packageInfoDependencies = document.getElementById('packageInfoDependencies');
  const packageInfoKeywords = document.getElementById('packageInfoKeywords');
  const packageInfoLicense = document.getElementById('packageInfoLicense');

  const rowPackageInfoButtons = document.querySelectorAll('.rowPackageInfoButton');
  rowPackageInfoButtons.forEach(button => {
    button.addEventListener('click', () => {
      const packageId = button.dataset.packageId;
      const info = PACKAGES[packageId];
      if (!info) return;

      packageInfoName.textContent = info.displayName;
      packageInfoId.textContent = info.name;
      packageInfoVersion.label = `v${info.version}`;
      packageInfoDescription.textContent = info.description;
      packageInfoAuthor.innerHTML = `${info.author.name} <md-icon>open_in_new</md-icon>`;
      packageInfoAuthor.href = info.author.url;

      // Dependencies
      packageInfoDependencies.innerHTML = '';
      const deps = Object.entries(info.dependencies);
      if (deps.length > 0) {
        document.getElementById('dependenciesSection').classList.remove('hidden');
        deps.forEach(([name, version]) => {
          const li = document.createElement('li');
          li.textContent = `${name} @ ${version}`;
          packageInfoDependencies.appendChild(li);
        });
      } else {
        document.getElementById('dependenciesSection').classList.add('hidden');
      }

      // Keywords
      packageInfoKeywords.innerHTML = '';
      if (info.keywords.length > 0) {
        document.getElementById('keywordsSection').classList.remove('hidden');
        info.keywords.forEach(kw => {
          const chip = document.createElement('md-assist-chip');
          chip.label = kw;
          packageInfoKeywords.appendChild(chip);
        });
      } else {
        document.getElementById('keywordsSection').classList.add('hidden');
      }

      // License
      if (info.license) {
        document.getElementById('licenseSection').classList.remove('hidden');
        packageInfoLicense.innerHTML = `${info.license} <md-icon>policy</md-icon>`;
        packageInfoLicense.href = info.licensesUrl || '#';
      } else {
        document.getElementById('licenseSection').classList.add('hidden');
      }

      packageInfoModal.show();
    });
  });

  // Modal close buttons
  document.getElementById('packageInfoModalClose').addEventListener('click', () => {
    packageInfoModal.close();
  });
  document.getElementById('addListingToVccHelpClose').addEventListener('click', () => {
    addListingToVccHelp.close();
  });

  // Download logic
  const rowMenuButtons = document.querySelectorAll('.rowMenuButton');
  rowMenuButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const url = button.dataset.packageUrl;
      if (url) window.open(url, '_blank');
    });
  });

})();
