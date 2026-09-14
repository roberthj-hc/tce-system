import { useEffect, useMemo, useState } from "react";
import { toast as sonner } from "sonner";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export type Category = {
  category_id?: number;
  name: string;
  description: string;
  section_id: number;
  is_active?: boolean;
};

export type Section = {
  section_id?: number;
  name: string;
  description: string;
  is_active?: boolean;
  categories?: Category[];
};

export function useSectionsList() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [sectionFilter, setSectionFilter] = useState<"all" | "active" | "inactive">("active");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "active" | "inactive">("all");

  const [sectionForm, setSectionForm] = useState<Section>({ name: "", description: "" });
  const [sectionEditing, setSectionEditing] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);

  const [categoryForm, setCategoryForm] = useState<Category>({
    name: "",
    description: "",
    section_id: 0,
  });
  const [categoryEditing, setCategoryEditing] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "deleteSection" | "deactivateCategory" | "activateCategory" | "activateSection";
    id: number | null;
  }>({ type: "deleteSection", id: null });
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/sections/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const sectionsData = await res.json();
      if (!res.ok) throw new Error();

      const enriched = await Promise.all(
        sectionsData.map(async (section: Section) => {
          try {
            const catRes = await fetch(`${apiUrl}/api/categories/section/${section.section_id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const cats = await catRes.json();
            return { ...section, categories: cats };
          } catch {
            return { ...section, categories: [] };
          }
        })
      );

      setSections(enriched);
    } catch {
      sonner.error("Error al cargar secciones y categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const filteredSections = useMemo(() => {
    const bySearch = sections.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    const byFilter = bySearch
      .filter((s) => {
        if (sectionFilter === "active") return s.is_active;
        if (sectionFilter === "inactive") return !s.is_active;
        return true;
      })
      .map((section) => {
        const filteredCategories = section.categories?.filter((cat) => {
          if (categoryFilter === "active") return cat.is_active;
          if (categoryFilter === "inactive") return !cat.is_active;
          return true;
        });
        return { ...section, categories: filteredCategories };
      });
    return byFilter.sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [sections, search, sortAsc, sectionFilter, categoryFilter]);

  const sectionsForSelect = useMemo(
    () => sections.map((s) => ({ section_id: s.section_id!, name: s.name })),
    [sections]
  );

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSectionForm({ ...sectionForm, [e.target.name]: e.target.value });
  };

  const resetSectionForm = () => {
    setSectionForm({ name: "", description: "" });
    setSectionEditing(false);
  };

  const handleSectionOpenCreate = () => {
    resetSectionForm();
    setSectionOpen(true);
  };

  const handleSectionEdit = (section: Section) => {
    setSectionForm({
      section_id: section.section_id,
      name: section.name,
      description: section.description,
      is_active: section.is_active,
    });
    setSectionEditing(true);
    setSectionOpen(true);
  };

  const submitSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = sectionEditing
      ? `${apiUrl}/api/sections/${sectionForm.section_id}`
      : `${apiUrl}/api/sections/register`;
    const method = sectionEditing ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: sectionForm.name, description: sectionForm.description }),
      });
      const data = await res.json();
      if (res.ok) {
        sonner.success(sectionEditing ? "Sección actualizada" : "Sección creada");
        setSectionOpen(false);
        resetSectionForm();
        fetchSections();
      } else {
        sonner.error(data?.error || "Error al guardar sección");
      }
    } catch {
      sonner.error("Error del servidor al guardar sección");
    }
  };

  const handleSectionDelete = async (id: number) => {
    setConfirmAction({ type: "deleteSection", id });
    setConfirmTitle("Eliminar/Desactivar Sección");
    setConfirmDescription("¿Estás seguro de que deseas eliminar/desactivar esta sección? Esta acción no se puede deshacer.");
    setConfirmOpen(true);
  };

  const handleActivateSection = (id: number) => {
    setConfirmAction({ type: "activateSection", id });
    setConfirmTitle("Activar Sección");
    setConfirmDescription("¿Estás seguro de que deseas activar esta sección?");
    setConfirmOpen(true);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };

  const handleCategorySectionChange = (section_id: number) => {
    setCategoryForm((prev) => ({ ...prev, section_id }));
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "", section_id: 0 });
    setCategoryEditing(false);
  };

  const openCategoryCreate = (section_id: number) => {
    resetCategoryForm();
    setCategoryForm({ name: "", description: "", section_id });
    setCategoryEditing(false);
    setCategoryOpen(true);
  };

  const openCategoryEdit = (category: Category) => {
    setCategoryForm({
      category_id: category.category_id,
      name: category.name,
      description: category.description,
      section_id: category.section_id,
      is_active: category.is_active,
    });
    setCategoryEditing(true);
    setCategoryOpen(true);
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.section_id) {
      sonner.error("Selecciona una sección");
      return;
    }

    const endpoint = categoryEditing
      ? `${apiUrl}/api/categories/${categoryForm.category_id}`
      : `${apiUrl}/api/categories/register`;
    const method = categoryEditing ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: categoryForm.name,
          description: categoryForm.description,
          section_id: categoryForm.section_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        sonner.success(categoryEditing ? "Categoría actualizada" : "Categoría creada");
        setCategoryOpen(false);
        resetCategoryForm();
        fetchSections();
      } else {
        sonner.error(data?.error || "Error al guardar categoría");
      }
    } catch {
      sonner.error("Error del servidor al guardar categoría");
    }
  };

  const handleDeactivateCategory = (id: number) => {
    setConfirmAction({ type: "deactivateCategory", id });
    setConfirmTitle("Eliminar/Desactivar Categoría");
    setConfirmDescription("¿Estás seguro de que deseas desactivar esta categoría?");
    setConfirmOpen(true);
  };

  const handleActivateCategory = (id: number) => {
    setConfirmAction({ type: "activateCategory", id });
    setConfirmTitle("Activar Categoría");
    setConfirmDescription("¿Estás seguro de que deseas activar esta categoría?");
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    const { type, id } = confirmAction;
    if (!id) return;

    try {
      let res;

      if (type === "deleteSection") {
        res = await fetch(`${apiUrl}/api/sections/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else if (type === "deactivateCategory") {
        res = await fetch(`${apiUrl}/api/categories/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else if (type === "activateCategory") {
        res = await fetch(`${apiUrl}/api/categories/activate/${id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else if (type === "activateSection") {
        res = await fetch(`${apiUrl}/api/sections/activate/${id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      const data = await res?.json();

      if (res?.ok) {
        sonner.success(data?.message || "Operación realizada correctamente");
        fetchSections();
      } else {
        sonner.error(
          data?.error ||
          `Error al ${type === "deleteSection"
            ? "eliminar la sección"
            : type === "deactivateCategory"
              ? "eliminar la categoría"
              : "actualizar el estado"
          }`
        );
      }
    } catch {
      sonner.error("Error del servidor al procesar la solicitud");
    }
  };


  return {
    filteredSections,
    loading,
    search,
    sortAsc,
    setSearch,
    setSortAsc,
    sectionFilter,
    setSectionFilter,
    categoryFilter,
    setCategoryFilter,
    sectionForm,
    sectionEditing,
    sectionOpen,
    setSectionOpen,
    handleSectionChange,
    submitSection,
    handleSectionEdit,
    handleSectionDelete,
    handleActivateSection,
    handleSectionOpenCreate,
    sectionsForSelect,
    categoryForm,
    categoryEditing,
    categoryOpen,
    setCategoryOpen,
    handleCategoryChange,
    submitCategory,
    openCategoryCreate,
    openCategoryEdit,
    handleCategorySectionChange,
    handleDeactivateCategory,
    handleActivateCategory,
    confirmOpen,
    setConfirmOpen,
    confirmTitle,
    confirmDescription,
    handleConfirm,
  };
}
