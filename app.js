
const addButton = document.getElementById("addPersonButton");
const personForm = document.getElementById("personForm");
const peopleList = document.getElementById("peopleList");
const emptyState = document.querySelector(".empty-state");

let people = JSON.parse(localStorage.getItem("memoriaPeople")) || [];
let editingId = null;

function savePeople() {
  localStorage.setItem("memoriaPeople", JSON.stringify(people));
}

function getDaysUntilBirthday(date) {
  const birthday = new Date(date + "T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextBirthday = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate()
  );

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  return Math.ceil((nextBirthday - today) / 86400000);
}

function displayPeople() {
  peopleList.innerHTML = "";

  if (emptyState) {
    emptyState.hidden = people.length > 0;
  }

  const sortedPeople = [...people].sort((a, b) =>
    getDaysUntilBirthday(a.birthday) -
    getDaysUntilBirthday(b.birthday)
  );

  sortedPeople.forEach((person) => {
    const card = document.createElement("article");
    card.className = "person-card";

    const title = document.createElement("h3");
    title.textContent = person.name;

    const date = document.createElement("p");
    date.textContent = new Date(
      person.birthday + "T12:00:00"
    ).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long"
    });

    const countdown = document.createElement("p");
    const days = getDaysUntilBirthday(person.birthday);

    countdown.textContent = days === 0
      ? "C'est aujourd'hui ! 🎂"
      : `Dans ${days} jour${days > 1 ? "s" : ""}`;

    const details = document.createElement("div");
    details.hidden = true;
    details.className = "person-details";

    function addDetail(label, value) {
      const paragraph = document.createElement("p");
      paragraph.textContent = `${label} : ${value || "Non renseigné"}`;
      details.appendChild(paragraph);
    }

    addDetail("Goûts et passions", person.tastes);
    addDetail("Tailles", person.sizes);
    addDetail("Ce qu'il/elle n'aime pas", person.dislikes);

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.textContent = "Voir la fiche";

    openButton.addEventListener("click", () => {
      details.hidden = !details.hidden;displayGifts(person);
      openButton.textContent = details.hidden
        ? "Voir la fiche"
        : "Fermer la fiche";
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Modifier";

    editButton.addEventListener("click", () => {
      editingId = person.id;

      document.getElementById("personName").value = person.name;
      document.getElementById("personBirthday").value = person.birthday;
      document.getElementById("personTastes").value = person.tastes || "";
      document.getElementById("personSizes").value = person.sizes || "";
      document.getElementById("personDislikes").value = person.dislikes || "";

      personForm.hidden = false;
      personForm.scrollIntoView({ behavior: "smooth" });
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Supprimer";

    deleteButton.addEventListener("click", () => {
      if (confirm(`Supprimer la fiche de ${person.name} ?`)) {
        people = people.filter(item => item.id !== person.id);
        savePeople();
        displayPeople();
      }
    });

    card.append(
      title,
      date,
      countdown,
      openButton,
      details,
      editButton,
      deleteButton
    );

    peopleList.appendChild(card);
  });
}

addButton.addEventListener("click", () => {
  editingId = null;
  personForm.reset();
  personForm.hidden = false;

  personForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

personForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const personData = {
    name: document.getElementById("personName").value.trim(),
    birthday: document.getElementById("personBirthday").value,
    tastes: document.getElementById("personTastes").value.trim(),
    sizes: document.getElementById("personSizes").value.trim(),
    dislikes: document.getElementById("personDislikes").value.trim()
  };

  if (!personData.name || !personData.birthday) return;

  if (editingId !== null) {
    people = people.map(person =>
      person.id === editingId
        ? { ...person, ...personData }
        : person
    );
  } else {
    people.push({
      id: Date.now(),
      ...personData
    });
  }

  savePeople();
  displayPeople();

  personForm.reset();
  personForm.hidden = true;
  editingId = null;
});

displayPeople();
// --- GESTION DES IDEES CADEAUX ---

const giftSection = document.getElementById("giftSection");
const giftForm = document.getElementById("giftForm");
const giftList = document.getElementById("giftList");

let selectedPersonId = null;

function displayGifts(person) {
    selectedPersonId = person.id;

    if (!person.gifts) {
        person.gifts = [];
    }

    giftSection.hidden = false;
    giftList.innerHTML = "";

    const ideasTitle = document.createElement("h4");
    ideasTitle.textContent = "Idées cadeaux";

    const ideasList = document.createElement("div");

    const historyTitle = document.createElement("h4");
    historyTitle.textContent = "Déjà offerts";

    const historyList = document.createElement("div");

    person.gifts.forEach((gift, index) => {
        const giftCard = document.createElement("div");
        giftCard.className = "gift-card";

        const name = document.createElement("p");
        name.textContent = gift.name;

        const price = document.createElement("p");
        price.textContent = gift.price
            ? `${gift.price} €`
            : "Prix non renseigné";

        giftCard.append(name, price);

        if (gift.offered) {
            const status = document.createElement("p");
            status.textContent = `Offert en ${gift.year}`;
            giftCard.append(status);
            historyList.append(giftCard);
        } else {
            const offeredButton = document.createElement("button");
            offeredButton.textContent = "Offert";

            offeredButton.addEventListener("click", () => {
                const people = JSON.parse(
                    localStorage.getItem("memoriaPeople")
                ) || [];

                const currentPerson = people.find(
                    p => p.id === person.id
                );

                if (!currentPerson) return;

                currentPerson.gifts[index].offered = true;
                currentPerson.gifts[index].year =
                    new Date().getFullYear();

                localStorage.setItem(
                    "memoriaPeople",
                    JSON.stringify(people)
                );

                displayGifts(currentPerson);
            });

            giftCard.append(offeredButton);
            ideasList.append(giftCard);
        }
    });

    if (ideasList.children.length === 0) {
        ideasList.textContent = "Aucune idée cadeau pour le moment.";
    }

    if (historyList.children.length === 0) {
        historyList.textContent = "Aucun cadeau offert pour le moment.";
    }

    giftList.append(
        ideasTitle,
        ideasList,
        historyTitle,
        historyList
    );
}
giftForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (selectedPersonId === null) return;

    const people = JSON.parse(localStorage.getItem("memoriaPeople")) || [];
    const person = people.find(p => p.id === selectedPersonId);

    if (!person) return;

    person.gifts = person.gifts || [];
    person.gifts.push({
        name: document.getElementById("giftName").value.trim(),
        price: document.getElementById("giftPrice").value,
        offered: false
    });

    localStorage.setItem("memoriaPeople", JSON.stringify(people));

    giftForm.reset();
    displayGifts(person);
});
// --- EXPORTER LES DONNEES DE MEMORIA ---

const exportButton = document.getElementById("exportButton");

exportButton.addEventListener("click", () => {
    const people = JSON.parse(
        localStorage.getItem("memoriaPeople")
    ) || [];

    const backup = JSON.stringify(people, null, 2);

    const file = new Blob([backup], {
        type: "application/json"
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(file);

    link.href = url;
    link.download = "memoria-sauvegarde.json";
    link.click();

    URL.revokeObjectURL(url);
});
// --- IMPORTER UNE SAUVEGARDE ---

const importButton = document.getElementById("importButton");
const importFile = document.getElementById("importFile");

importButton.addEventListener("click", () => {
    importFile.click();
});

importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const importedPeople = JSON.parse(e.target.result);

            if (!Array.isArray(importedPeople)) {
                throw new Error("Fichier invalide");
            }

            const validPeople = importedPeople.every(person =>
                person &&
                typeof person.id === "number" &&
                typeof person.name === "string" &&
                typeof person.birthday === "string" &&
                Array.isArray(person.gifts || [])
            );

            if (!validPeople) {
                throw new Error("Données invalides");
            }

            if (confirm("Cette importation remplacera tes données actuelles. Continuer ?")) {
                localStorage.setItem(
                    "memoriaPeople",
                    JSON.stringify(importedPeople)
                );

                location.reload();
            }

        } catch (error) {
            alert("Impossible d'importer ce fichier. Vérifie qu'il s'agit d'une sauvegarde MÉMORIA.");
        }

        importFile.value = "";
    };

    reader.readAsText(file);
});
// --- NAVIGATION MEMORIA ---

const homeTab = document.getElementById("homeTab");
const peopleTab = document.getElementById("peopleTab");
const giftsTab = document.getElementById("giftsTab");

homeTab.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

peopleTab.addEventListener("click", () => {
    document.getElementById("peopleList").scrollIntoView({
        behavior: "smooth"
    });
});

peopleTab.addEventListener("click", () => {
    document.getElementById("allGiftsSection").hidden = true;
    document.getElementById("peopleList").hidden = false;
    giftSection.hidden = true;

    document.getElementById("peopleList").scrollIntoView({
        behavior: "smooth"
    });
});
// --- PAGE CADEAUX ---

function displayAllGifts() {
    const people = JSON.parse(
        localStorage.getItem("memoriaPeople")
    ) || [];

    const ideas = document.getElementById("allGiftIdeas");
    const history = document.getElementById("allGiftHistory");

    ideas.innerHTML = "";
    history.innerHTML = "";

    people.forEach(person => {
        (person.gifts || []).forEach(gift => {
            const card = document.createElement("div");
            card.className = "gift-card";

            const name = document.createElement("p");
            name.textContent = gift.name;

            const owner = document.createElement("p");
            owner.textContent = `Pour ${person.name}`;

            const price = document.createElement("p");
            price.textContent = gift.price
                ? `${gift.price} €`
                : "Prix non renseigné";

            card.append(name, owner, price);

            if (gift.offered) {
                const year = document.createElement("p");
                year.textContent = `Offert en ${gift.year}`;
                card.append(year);
                history.append(card);
            } else {
                ideas.append(card);
            }
        });
    });

    if (!ideas.children.length) {
        ideas.textContent = "Aucune idée cadeau pour le moment.";
    }

    if (!history.children.length) {
        history.textContent = "Aucun cadeau offert pour le moment.";
    }
}
giftsTab.addEventListener("click", () => {
    document.getElementById("peopleList").hidden = true;
    giftSection.hidden = true;

    const allGiftsSection = document.getElementById("allGiftsSection");
    allGiftsSection.hidden = false;

    displayAllGifts();

    allGiftsSection.scrollIntoView({
        behavior: "smooth"
    });
});
// PROCHAINS ANNIVERSAIRES

function displayUpcomingBirthdays() {
    const people = JSON.parse(localStorage.getItem("memoriaPeople")) || [];
    const container = document.getElementById("upcomingBirthdays");

    container.innerHTML = "";
    const summary = document.getElementById("birthdaySummary");
summary.textContent = "";

    if (people.length === 0) {
        container.textContent = "Ajoutez une personne pour voir ses prochains anniversaires.";
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = people.map(person => {
        const parts = person.birthday.split("-");
        const month = Number(parts[1]) - 1;
        const day = Number(parts[2]);

        let nextBirthday = new Date(today.getFullYear(), month, day);

        if (nextBirthday < today) {
            nextBirthday = new Date(today.getFullYear() + 1, month, day);
        }

        const daysLeft = Math.round(
            (nextBirthday - today) / (1000 * 60 * 60 * 24)
        );

        return {
            name: person.name,
            date: nextBirthday,
            daysLeft: daysLeft
        };
    });

    upcoming.sort((a, b) => a.daysLeft - b.daysLeft);
    const nextName = document.getElementById("nextBirthdayName");
const nextCountdown = document.getElementById("nextBirthdayCountdown");

if (upcoming.length > 0) {
    const nextPerson = upcoming[0];

    nextName.textContent = nextPerson.name;

    if (nextPerson.daysLeft === 0) {
        nextCountdown.textContent = "C'est son anniversaire aujourd'hui !";
    } else if (nextPerson.daysLeft === 1) {
        nextCountdown.textContent = "Plus qu'un jour !";
    } else {
        nextCountdown.textContent = `Dans ${nextPerson.daysLeft} jours`;
    }
} else {
    nextName.textContent = "Aucun anniversaire enregistré";
    nextCountdown.textContent = "";
}
    summary.textContent =
    `${upcoming.length} anniversaire(s) à venir`;

if (upcoming.length > 0) {
    const next = upcoming[0];
    summary.textContent +=
        ` · Le prochain est celui de ${next.name} !`;
}
    upcoming.slice(0, 3).forEach(person => {
        const item = document.createElement("p");
        const date = person.date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long"
        });

        item.textContent = `${person.name} — ${date} (dans ${person.daysLeft} jour(s))`;
        container.appendChild(item);
    });
}

displayUpcomingBirthdays();