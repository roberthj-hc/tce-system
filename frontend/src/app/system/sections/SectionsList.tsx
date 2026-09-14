"use client";

import { useSectionsList } from "./useSectionsList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, ArrowUpDown, Tag } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function SectionsList() {
  const {
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
    sectionOpen,
    sectionEditing,
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
  } = useSectionsList();

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold text-primary">Secciones</h2>
          <Badge variant="secondary">{filteredSections.length}</Badge>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Buscar sección por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <div className="flex gap-2">
            <Select
              value={sectionFilter}
              onValueChange={(value) => setSectionFilter(value as "all" | "active" | "inactive")}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setSortAsc(!sortAsc)}>
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {sortAsc ? "Ascendente" : "Descendente"}
            </Button>
            <Button onClick={handleSectionOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar sección
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Categorías</h3>
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value as "all" | "active" | "inactive")}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="inactive">Inactivas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p>Cargando secciones...</p>
      ) : filteredSections.length === 0 ? (
        <p>No hay secciones que coincidan.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSections.map((section) => (
            <Card
              key={section.section_id}
              className={`relative group transition-all hover:shadow-lg ${
                !section.is_active ? "border-red-500 text-red-800" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className={`truncate ${!section.is_active ? "text-red-600" : ""}`}>
                    {section.name}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p
                  className={`text-sm min-h-5 ${
                    !section.is_active ? "text-red-700" : "text-muted-foreground"
                  }`}
                >
                  {section.description || "Sin descripción"}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Categorías ({section.categories?.length || 0})
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCategoryCreate(section.section_id!)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </div>

                  {section.categories && section.categories.length > 0 ? (
                    <div className="space-y-2">
                      {section.categories.map((cat) => (
                        <div
                          key={cat.category_id}
                          className={`flex items-start justify-between rounded-lg border px-3 py-2 ${
                            !cat.is_active ? "border-red-300" : "bg-card border-slate-200"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-sm font-medium truncate ${
                                  !cat.is_active ? "text-red-600" : ""
                                }`}
                              >
                                {cat.name}
                              </p>
                              {!cat.is_active && (
                                <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                                  Inactivo
                                </Badge>
                              )}
                            </div>
                            <p
                              className={`text-xs truncate ${
                                !cat.is_active ? "text-red-500" : "text-muted-foreground"
                              }`}
                            >
                              {cat.description || "Sin descripción"}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openCategoryEdit(cat)}
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {!cat.is_active ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleActivateCategory(cat.category_id!)}
                                title="Activar"
                              >
                                <Plus className="w-4 h-4 text-green-500" />
                              </Button>
                            ) : (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeactivateCategory(cat.category_id!)}
                                title="Desactivar"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No hay categorías en esta sección.</p>
                  )}
                </div>
              </CardContent>

              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!section.is_active ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleActivateSection(section.section_id!)}
                    title="Activar sección"
                  >
                    <Plus className="w-4 h-4 text-green-500" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSectionEdit(section)}
                      title="Editar sección"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSectionDelete(section.section_id!)}
                      title="Eliminar/Desactivar sección"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={sectionOpen} onOpenChange={setSectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{sectionEditing ? "Editar sección" : "Agregar sección"}</DialogTitle>
            <DialogDescription>
              {sectionEditing
                ? "Modifica los datos de la sección"
                : "Completa los campos para registrar una nueva sección"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSection} className="space-y-4">
            <Input
              name="name"
              placeholder="Nombre"
              value={sectionForm.name}
              onChange={handleSectionChange}
              required
            />
            <Input
              name="description"
              placeholder="Descripción"
              value={sectionForm.description}
              onChange={handleSectionChange}
            />
            <div className="flex justify-end">
              <Button type="submit">{sectionEditing ? "Guardar cambios" : "Registrar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{categoryEditing ? "Editar categoría" : "Agregar categoría"}</DialogTitle>
            <DialogDescription>
              {categoryEditing
                ? "Modifica los datos o mueve la categoría a otra sección"
                : "Completa los campos para registrar una nueva categoría"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCategory} className="space-y-4">
            <Input
              name="name"
              placeholder="Nombre de la categoría"
              value={categoryForm.name}
              onChange={handleCategoryChange}
              required
            />
            <Input
              name="description"
              placeholder="Descripción"
              value={categoryForm.description}
              onChange={handleCategoryChange}
            />
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Sección</label>
              <Select
                value={String(categoryForm.section_id || "")}
                onValueChange={(v) => handleCategorySectionChange(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una sección" />
                </SelectTrigger>
                <SelectContent>
                  {sectionsForSelect.map((s) => (
                    <SelectItem key={s.section_id} value={String(s.section_id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit">{categoryEditing ? "Guardar cambios" : "Registrar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmTitle}</DialogTitle>
            <DialogDescription>{confirmDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
